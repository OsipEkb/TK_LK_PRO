import json, traceback
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .services.autograph import AutoGraphService

service = AutoGraphService()


@method_decorator(csrf_exempt, name='dispatch')
class AutoGraphInitView(View):
    def post(self, request):
        try:
            body = json.loads(request.body)
            sid = service.get_session_token(body.get('username'), body.get('password'))
            if not sid: return JsonResponse({'error': 'Auth failed'}, status=401)

            schemas = service.get_schemas(sid)
            sch_id = schemas[0]['ID'] if schemas else None
            items = service.get_vehicles_by_schema(sid, sch_id)

            ids_str = ",".join([str(d['ID']) for d in items])
            online_raw = service.get_online_info(sid, sch_id, ids_str)

            props_dict = {}
            for dev in items:
                v_id = str(dev['ID'])
                reg_num, total_max_f = "—", 0
                for prop in dev.get('Properties', []):
                    if prop.get('Name') == 'VehicleRegNumber': reg_num = prop.get('Value', '—')
                    if 'LLS' in prop.get('Name', ''):
                        val = prop.get('Value')
                        if isinstance(val, dict):
                            taring = val.get('items', [])
                            if taring: total_max_f += max((i.get('outputVal', 0) for i in taring), default=0)
                props_dict[v_id] = {'RegNumber': reg_num, 'MaxFuel': total_max_f}

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
                "session_id": sid, "schema_id": sch_id,
                "vehicles": items, "online": online_dict, "props": props_dict
            })
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class AutoGraphAnalyticsView(View):
    def get(self, request):
        try:
            sid = request.GET.get('session')
            sch = request.GET.get('schema_id')
            did = request.GET.get('device_id')
            start = request.GET.get('from').replace('T', ' ')
            end = request.GET.get('to').replace('T', ' ')

            # 1. Получаем свойства для тарировок и маппинга параметров
            items = service.get_vehicles_by_schema(sid, sch)
            dev = next((i for i in items if str(i['ID']) == did), None)
            if not dev: return JsonResponse({'error': 'Device not found'}, status=404)

            # Тарировки LLS
            taring_tables = {}
            for p in dev.get('Properties', []):
                name = p.get('Name', '')
                if 'LLS' in name and isinstance(p.get('Value'), dict):
                    table = p['Value'].get('items', [])
                    if table: taring_tables[name] = table

            # 2. Запрос трека
            raw_track = service.get_track_data(sid, sch, did, start, end)

            points = []
            for pt in raw_track:
                # Базовый расчет топлива
                fuel_val = sum(service.interpolate_fuel(pt.get(name, 0), table)
                               for name, table in taring_tables.items())

                # УНИВЕРСАЛЬНЫЙ СБОРЩИК:
                # Мы берем ВСЕ ключи из точки, чтобы фронт мог строить любые графики
                point_data = {
                    "t": pt.get('DT'),
                    "f": round(fuel_val, 1),
                    "s": round(pt.get('Speed', 0), 1),
                }

                # Добавляем все остальные параметры, которые прислал прибор (RPM, Volt, Inputs и т.д.)
                # Исключаем служебные поля
                excluded = ['DT', 'Speed', 'Latitude', 'Longitude']
                for key, value in pt.items():
                    if key not in excluded and key not in taring_tables:
                        # Сохраняем как есть (числа или флаги)
                        point_data[key] = value

                points.append(point_data)

            return JsonResponse({"points": points, "count": len(points)})
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)