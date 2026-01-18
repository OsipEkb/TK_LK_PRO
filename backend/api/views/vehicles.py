"""
Views для работы с транспортными средствами.
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


def extract_vehicle_info(vehicle):
    """Извлечение информации из данных транспортного средства"""
    if not isinstance(vehicle, dict):
        return None

    reg_number = "—"
    max_fuel = 0.0

    properties = vehicle.get('Properties', [])

    for prop in properties:
        if not isinstance(prop, dict):
            continue

        prop_name = prop.get('Name', '')
        prop_value = prop.get('Value')

        if prop_name == 'VehicleRegNumber':
            if isinstance(prop_value, str):
                reg_number = prop_value

        # Ищем ДУТы
        if 'LLS' in prop_name and isinstance(prop_value, dict):
            items = prop_value.get('items', [])
            if items:
                # Находим максимальное значение outputVal
                max_val = max((item.get('outputVal', 0) for item in items), default=0)
                max_fuel += max_val

    return {
        'ID': vehicle.get('ID', ''),
        'Name': vehicle.get('Name', ''),
        'Properties': properties,
        'reg_number': reg_number,
        'max_fuel': max_fuel
    }


@method_decorator(csrf_exempt, name='dispatch')
class VehicleListView(APIView):
    """
    Получение списка транспортных средств.
    GET /api/vehicles/?session_id=<session_id>&schema_id=<schema_id>
    """

    def get(self, request):
        session_id = request.GET.get('session_id')
        schema_id = request.GET.get('schema_id')

        if not session_id or not schema_id:
            return Response({
                'error': 'session_id and schema_id parameters are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Ключ для кэша
        cache_key = get_cache_key('vehicles', session_id, schema_id)
        cached_data = cache.get(cache_key)

        if cached_data:
            logger.debug(f"Returning cached vehicles for schema {schema_id}")
            return Response(cached_data)

        try:
            # Получаем транспортные средства из AutoGRAPH
            response_data = service.get_vehicles_by_schema(session_id, schema_id)

            # Проверяем структуру ответа
            if not response_data:
                return Response({
                    'success': True,
                    'vehicles': [],
                    'count': 0
                })

            # Определяем структуру ответа
            if isinstance(response_data, dict):
                # Новый формат: {ID: "...", Groups: [...], Items: [...]}
                vehicles = response_data.get('Items', [])
                groups = response_data.get('Groups', [])
            elif isinstance(response_data, list):
                # Старый формат: просто список
                vehicles = response_data
                groups = []
            else:
                vehicles = []
                groups = []

            # Обрабатываем каждое транспортное средство
            processed_vehicles = []
            for vehicle in vehicles:
                if isinstance(vehicle, dict):
                    vehicle_info = extract_vehicle_info(vehicle)
                    if vehicle_info:
                        processed_vehicles.append(vehicle_info)

            # Формируем ответ
            response_data = {
                'success': True,
                'vehicles': processed_vehicles,
                'groups': groups,
                'count': len(processed_vehicles),
                'schema_id': schema_id
            }

            # Кэшируем на 5 минут
            cache.set(cache_key, response_data, timeout=300)

            return Response(response_data)

        except Exception as e:
            logger.error(f"Error fetching vehicles: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({
                'error': f'Failed to fetch vehicles: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class VehicleOnlineView(APIView):
    """
    Получение онлайн-данных транспортных средств.
    GET /api/vehicles/online/?session_id=<session_id>&schema_id=<schema_id>&device_ids=<id1,id2,...>
    """

    def get(self, request):
        session_id = request.GET.get('session_id')
        schema_id = request.GET.get('schema_id')
        device_ids = request.GET.get('device_ids')

        if not all([session_id, schema_id, device_ids]):
            return Response({
                'error': 'session_id, schema_id and device_ids parameters are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Ключ для кэша (короткое время)
        cache_key = get_cache_key('online', session_id, schema_id, device_ids)
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        try:
            # Получаем онлайн-данные
            raw_online = service.get_online_info(session_id, schema_id, device_ids)

            if not raw_online:
                return Response({
                    'success': True,
                    'online_data': {}
                })

            # Обрабатываем данные для каждого устройства
            processed_online = {}
            for device_id, data in raw_online.items():
                try:
                    if not isinstance(data, dict):
                        continue

                    final_data = data.get('Final', {})

                    # Извлекаем моточасы из FDT
                    fdt_str = final_data.get('FDT', '0')
                    moto_hours = service.parse_moto_hours(fdt_str)

                    # Формируем объект
                    processed_online[device_id] = {
                        'Address': data.get('Address', 'Координаты не определены'),
                        'Speed': data.get('Speed', 0),
                        'DT': data.get('DT'),
                        'moto_hours': moto_hours,
                        'ignition': final_data.get('DIgnition', False),
                        'fuel': final_data.get('TankMainFuelLevel', 0),
                    }

                except Exception as device_error:
                    logger.error(f"Error processing device {device_id}: {device_error}")
                    # Добавляем устройство с минимальными данными
                    processed_online[device_id] = {
                        'Address': 'Ошибка обработки данных',
                        'Speed': 0,
                        'DT': None,
                        'moto_hours': 0,
                        'ignition': False,
                        'fuel': 0,
                    }

            # Формируем ответ
            response_data = {
                'success': True,
                'online_data': processed_online,
                'count': len(processed_online)
            }

            # Кэшируем на 30 секунд
            cache.set(cache_key, response_data, timeout=30)

            return Response(response_data)

        except Exception as e:
            logger.error(f"Error fetching online data: {e}")
            return Response({
                'error': f'Failed to fetch online data: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)