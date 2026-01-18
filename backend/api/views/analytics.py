"""
Views для аналитики и графиков.
"""
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.cache import cache

from ..services.autograph import AutoGraphService
from ..utils.cache import get_cache_key

logger = logging.getLogger(__name__)
service = AutoGraphService()


@method_decorator(csrf_exempt, name='dispatch')
class AnalyticsTrackView(APIView):
    """
    Получение данных трека для построения графиков.
    GET /api/analytics/track/?session=<session>&schema_id=<schema_id>&device_id=<device_id>&from=<date>&to=<date>
    """

    def get(self, request):
        # Получаем параметры напрямую
        session_id = request.GET.get('session')
        schema_id = request.GET.get('schema_id')
        device_id = request.GET.get('device_id')
        date_from = request.GET.get('from')
        date_to = request.GET.get('to')

        # Валидация
        errors = {}
        if not session_id:
            errors['session'] = ['This field is required.']
        if not schema_id:
            errors['schema_id'] = ['This field is required.']
        if not device_id:
            errors['device_id'] = ['This field is required.']
        if not date_from:
            errors['from'] = ['This field is required.']
        if not date_to:
            errors['to'] = ['This field is required.']

        if errors:
            return Response({
                'error': 'Invalid parameters',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)

        if date_from >= date_to:
            return Response({
                'error': 'Invalid parameters',
                'details': {'from': ['Начальная дата должна быть раньше конечной']}
            }, status=status.HTTP_400_BAD_REQUEST)

        # Форматируем даты для AutoGRAPH API: YYYYMMDD-HHMM
        try:
            # Пример: "2026-01-17 09:56:50" -> "20260117-0956"
            from_clean = date_from.replace('-', '').replace(':', '').replace(' ', '')
            to_clean = date_to.replace('-', '').replace(':', '').replace(' ', '')

            # Формат: YYYYMMDD-HHMM
            from_formatted = f"{from_clean[:8]}-{from_clean[8:12]}"
            to_formatted = f"{to_clean[:8]}-{to_clean[8:12]}"

            logger.info(f"Formatted dates: from={from_formatted}, to={to_formatted}")

        except Exception as e:
            logger.error(f"Date formatting error: {e}")
            return Response({
                'error': f'Invalid date format: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Ключ для кэша
        cache_key = get_cache_key('track', session_id, schema_id, device_id, from_formatted, to_formatted)
        cached_data = cache.get(cache_key)

        if cached_data:
            logger.debug(f"Returning cached track data for device {device_id}")
            return Response(cached_data)

        try:
            # 1. Получаем свойства транспортного средства для тарировок ДУТ
            vehicles_response = service.get_vehicles_by_schema(session_id, schema_id)

            # Определяем структуру ответа
            if isinstance(vehicles_response, dict):
                vehicles = vehicles_response.get('Items', [])
            elif isinstance(vehicles_response, list):
                vehicles = vehicles_response
            else:
                vehicles = []

            # Ищем нужное транспортное средство
            vehicle = None
            for v in vehicles:
                if str(v.get('ID')) == device_id:
                    vehicle = v
                    break

            if not vehicle:
                return Response({
                    'error': True,
                    'message': f"Device with ID {device_id} not found"
                }, status=status.HTTP_404_NOT_FOUND)

            # 2. Извлекаем таблицы тарировок ДУТ
            taring_tables = {}
            for prop in vehicle.get('Properties', []):
                name = prop.get('Name', '')
                if 'LLS' in name and isinstance(prop.get('Value'), dict):
                    table = prop['Value'].get('items', [])
                    if table:
                        taring_tables[name] = table

            # 3. Получаем данные трека
            raw_track = service.get_track_data(
                session_id,
                schema_id,
                device_id,
                from_formatted,
                to_formatted
            )

            # 4. Обрабатываем данные трека
            points = []

            logger.info(f"Track data received, type: {type(raw_track)}")

            if not raw_track:
                return Response({
                    'success': True,
                    'points': [],
                    'count': 0,
                    'message': 'No track data available',
                    'device_id': device_id
                })

            # Структура ответа может быть разной
            if isinstance(raw_track, dict):
                # Формат: {device_id: [segments]}
                track_segments = raw_track.get(device_id, [])
            elif isinstance(raw_track, list):
                # Формат: [segments]
                track_segments = raw_track
            else:
                track_segments = []

            logger.info(f"Track segments count: {len(track_segments)}")

            for segment in track_segments:
                if not isinstance(segment, dict):
                    continue

                dt_array = segment.get('DT', [])
                speed_array = segment.get('Speed', [])

                # Создаем точки для каждой записи в массивах
                for i in range(min(len(dt_array), len(speed_array))):
                    point = {
                        't': dt_array[i],
                        's': speed_array[i],
                    }

                    # Добавляем координаты если есть
                    lat_array = segment.get('Lat', [])
                    lng_array = segment.get('Lng', [])
                    if i < len(lat_array) and i < len(lng_array):
                        point['lat'] = lat_array[i]
                        point['lng'] = lng_array[i]

                    # Расчет топлива
                    fuel_val = 0.0
                    for sensor_name, table in taring_tables.items():
                        sensor_array = segment.get(sensor_name)
                        if sensor_array and i < len(sensor_array):
                            raw_value = sensor_array[i]
                            if raw_value is not None:
                                fuel_val += service.interpolate_fuel(raw_value, table)

                    point['f'] = round(fuel_val, 1) if fuel_val > 0 else 0.0

                    points.append(point)

            # 5. Формируем ответ
            response_data = {
                'success': True,
                'points': points,
                'count': len(points),
                'device_id': device_id,
                'period': {
                    'from': date_from,
                    'to': date_to
                }
            }

            # 6. Кэшируем на 10 минут
            cache.set(cache_key, response_data, timeout=600)

            return Response(response_data)

        except Exception as e:
            logger.error(f"Error fetching track data for device {device_id}: {e}")
            import traceback
            logger.error(traceback.format_exc())

            return Response({
                'error': f'Failed to fetch track data: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)