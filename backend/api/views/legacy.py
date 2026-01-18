import json
import traceback
import logging
import re
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from ..services.autograph import AutoGraphService

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class AutoGraphInitView(View):
    def post(self, request):
        service = AutoGraphService()
        try:
            body = json.loads(request.body)
            username = body.get('username')
            password = body.get('password')

            sid = service.get_session_token(username, password)
            if not sid:
                return JsonResponse({'error': 'Auth failed'}, status=401)

            schemas = service.get_schemas(sid)
            if not schemas:
                return JsonResponse({'error': 'No schemas found'}, status=404)

            sch_id = schemas[0].get('ID')
            items = service.get_vehicles_by_schema(sid, sch_id)

            if not items:
                return JsonResponse({
                    "session_id": sid, "schema_id": sch_id,
                    "vehicles": [], "online": {}, "props": {}
                })

            ids_str = ",".join([str(d['ID']) for d in items])
            online_raw = service.get_online_info(sid, sch_id, ids_str)

            props_dict = {}
            for dev in items:
                v_id = str(dev['ID'])
                reg_num, total_max_f = "—", 0.0
                for prop in dev.get('Properties', []):
                    if prop.get('Name') == 'VehicleRegNumber':
                        reg_num = prop.get('Value', '—')
                    if prop.get('Name') and 'LLS' in prop.get('Name'):
                        val = prop.get('Value')
                        if isinstance(val, dict):
                            taring = val.get('items', [])
                            if taring:
                                vals = [i.get('outputVal') for i in taring if i.get('outputVal') is not None]
                                if vals:
                                    total_max_f += float(max(vals))
                props_dict[v_id] = {'RegNumber': reg_num, 'MaxFuel': total_max_f}

            online_dict = {}
            if isinstance(online_raw, dict):
                for v_id, item in online_raw.items():
                    if not isinstance(item, dict): continue
                    final = item.get('Final', {})

                    raw_spd = item.get('Speed', 0)
                    speed = round(abs(float(raw_spd))) if raw_spd is not None else 0

                    fuel_l = final.get('TankMainFuelLevel', 0)
                    fuel_val = float(fuel_l) if fuel_l is not None else 0.0
                    max_f = props_dict.get(v_id, {}).get('MaxFuel', 0)

                    f_percent = 0
                    if max_f > 0:
                        f_percent = round(min(100, (fuel_val / max_f) * 100))

                    online_dict[v_id] = {
                        'Address': item.get('Address') or 'Координаты не определены',
                        'Speed': speed,
                        'LastData': item.get('DT'),
                        'Moto': service.parse_moto_hours(final.get('FDT', '0')),
                        'Ignition': final.get('DIgnition') or False,
                        'Fuel': round(fuel_val),
                        'FuelPercent': f_percent
                    }

            return JsonResponse({
                "session_id": sid, "schema_id": sch_id,
                "vehicles": items, "online": online_dict, "props": props_dict
            })
        except Exception as e:
            logger.error(f"Init Error: {traceback.format_exc()}")
            return JsonResponse({'error': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class AutoGraphAnalyticsView(View):
    def get(self, request):
        service = AutoGraphService()
        try:
            # Гибкий прием токена
            sid = request.GET.get('session_id') or request.GET.get('session')
            sch = request.GET.get('schema_id')
            did = request.GET.get('device_id')
            raw_from = request.GET.get('from')
            raw_to = request.GET.get('to')

            if not all([sid, sch, did, raw_from, raw_to]):
                return JsonResponse({'error': 'Missing params'}, status=400)

            # Очистка даты для API АвтоГРАФ
            def clean_date_string(dt_str):
                digits = re.sub(r'\D', '', dt_str)
                if len(digits) >= 12:
                    return f"{digits[:8]}-{digits[8:12]}"
                return digits

            sd = clean_date_string(raw_from)
            ed = clean_date_string(raw_to)

            raw_track = service.get_track_data(sid, sch, did, sd, ed)

            formatted_track = []
            if isinstance(raw_track, dict):
                t_data = raw_track.get(did) or raw_track.get(str(did))
                if t_data and 'DT' in t_data:
                    timestamps = t_data.get('DT', [])
                    speeds = t_data.get('Speed', [])
                    # Сохраняем логику извлечения топлива для будущих графиков
                    fuels = t_data.get('TankMainFuelLevel', [0] * len(timestamps))

                    for i in range(len(timestamps)):
                        try:
                            ts = int(timestamps[i]) * 1000
                            val_speed = round(abs(float(speeds[i])))
                            # Формируем структуру, которая не потеряет данные
                            formatted_track.append([ts, val_speed])
                        except:
                            continue

            return JsonResponse({"track": formatted_track, "device_id": did})
        except Exception as e:
            logger.error(f"Analytics Error: {traceback.format_exc()}")
            return JsonResponse({'error': str(e)}, status=500)