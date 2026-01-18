"""
Legacy views для обратной совместимости.
"""
import json
import traceback
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from ..services.autograph import AutoGraphService

service = AutoGraphService()


@method_decorator(csrf_exempt, name='dispatch')
class AutoGraphInitView(View):
    """Оригинальный view - работает с реальной структурой данных"""
    def post(self, request):
        try:
            body = json.loads(request.body)
            sid = service.get_session_token(body.get('username'), body.get('password'))
            if not sid:
                return JsonResponse({'error': 'Auth failed'}, status=401)

            schemas = service.get_schemas(sid)
            sch_id = schemas[0]['ID'] if schemas else None

            # Получаем транспортные средства
            vehicles_response = service.get_vehicles_by_schema(sid, sch_id)
            if isinstance(vehicles_response, dict):
                items = vehicles_response.get('Items', [])
            else:
                items = vehicles_response

            # Формируем строку ID устройств
            ids_str = ",".join([str(d['ID']) for d in items])
            online_raw = service.get_online_info(sid, sch_id, ids_str)

            # Обрабатываем свойства
            props_dict = {}
            for dev in items:
                v_id = str(dev['ID'])
                reg_num, total_max_f = "—", 0
                for prop in dev.get('Properties', []):
                    if prop.get('Name') == 'VehicleRegNumber':
                        reg_num = prop.get('Value', '—')
                    if 'LLS' in prop.get('Name', ''):
                        val = prop.get('Value')
                        if isinstance(val, dict):
                            taring = val.get('items', [])
                            if taring:
                                total_max_f += max((i.get('outputVal', 0) for i in taring), default=0)
                props_dict[v_id] = {'RegNumber': reg_num, 'MaxFuel': total_max_f}

            # Обрабатываем онлайн данные
            online_dict = {}
            for v_id, item in online_raw.items():
                final = item.get('Final', {})
                online_dict[v_id] = {
                    'Address': item.get('Address') or 'Координаты не определены',
                    'Speed': item.get('Speed') or 0,
                    'LastData': item.get('DT'),
                    'Moto': service.parse_moto_hours(final.get('FDT', '0')),
                    'Ignition': final.get('DIgnition') or False,
                    'Fuel': final.get('TankMainFuelLevel') or 0,
                }

            return JsonResponse({
                "session_id": sid,
                "schema_id": sch_id,
                "vehicles": items,
                "online": online_dict,
                "props": props_dict
            })
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class AutoGraphAnalyticsView(View):
    """Оригинальный view - исправляем форматирование дат"""
    def get(self, request):
        try:
            sid = request.GET.get('session')
            sch = request.GET.get('schema_id')
            did = request.GET.get('device_id')
            start = request.GET.get('from')
            end = request.GET.get('to')

            if not all([sid, sch, did, start, end]):
                return JsonResponse({'error': 'Missing required parameters'}, status=400)

            # Форматируем даты
            start = start.replace('T', ' ')
            end = end.replace('T', ' ')

            # 1. Получаем свойства для тарировок
            vehicles_response = service.get_vehicles_by_schema(sid, sch)
            if isinstance(vehicles_response, dict):
                items = vehicles_response.get('Items', [])
            else:
                items = vehicles_response

            dev = next((i for i in items if str(i['ID']) == did), None)
            if not dev:
                return JsonResponse({'error': 'Device not found'}, status=404)

            # Тарировки LLS
            taring_tables = {}
            for p in dev.get('Properties', []):
                name = p.get('Name', '')
                if 'LLS' in name and isinstance(p.get('Value'), dict):
                    table = p['Value'].get('items', [])
                    if table:
                        taring_tables[name] = table

            # 2. Запрос трека с правильными параметрами
            # Форматируем даты для AutoGRAPH: YYYYMMDD-HHMM
            from_clean = start.replace('-', '').replace(':', '').replace(' ', '')
            to_clean = end.replace('-', '').replace(':', '').replace(' ', '')

            from_date = f"{from_clean[:8]}-{from_clean[8:12]}"  # SD
            to_date = f"{to_clean[:8]}-{to_clean[8:12]}"        # ED

            raw_track = service.get_track_data(sid, sch, did, from_date, to_date)

            # Если пустой ответ или ошибка
            if not raw_track:
                return JsonResponse({"points": [], "count": 0})

            # 3. Обрабатываем данные трека
            if isinstance(raw_track, dict):
                track_data = raw_track.get(did, [])
            else:
                track_data = raw_track

            points = []
            for segment in track_data:
                if not isinstance(segment, dict):
                    continue

                dt_array = segment.get('DT', [])
                speed_array = segment.get('Speed', [])

                for i in range(min(len(dt_array), len(speed_array))):
                    # Расчет топлива
                    fuel_val = 0.0
                    for name, table in taring_tables.items():
                        sensor_array = segment.get(name)
                        if sensor_array and i < len(sensor_array):
                            raw_value = sensor_array[i]
                            if raw_value is not None:
                                fuel_val += service.interpolate_fuel(raw_value, table)

                    # Создаем точку
                    point_data = {
                        "t": dt_array[i],
                        "f": round(fuel_val, 1),
                        "s": round(speed_array[i], 1),
                    }

                    # Добавляем другие параметры
                    excluded = ['DT', 'Speed', 'Lat', 'Lng', 'Index', 'Photos', 'ColorSettings']
                    for key, value in segment.items():
                        if key not in excluded and key not in taring_tables:
                            if isinstance(value, list) and i < len(value):
                                point_data[key] = value[i]
                            else:
                                point_data[key] = value

                    points.append(point_data)

            return JsonResponse({"points": points, "count": len(points)})

        except Exception as e:
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)