import requests
import logging
import numpy as np
from typing import Optional, Dict, List, Any
import json

logger = logging.getLogger(__name__)


class AutoGraphService:
    def __init__(self):
        self.base_url = "https://web.tk-ekat.ru/ServiceJSON"

    def get_session_token(self, user: str, password: str) -> Optional[str]:
        url = f"{self.base_url}/Login"
        params = {"UserName": user, "Password": password}
        try:
            with requests.Session() as s:
                response = s.get(url, params=params, timeout=15)
                response.raise_for_status()
                token = response.text.strip().replace('"', '')
                return token if (token and len(token) > 20) else None
        except Exception as e:
            logger.error(f"❌ Auth Error: {e}")
            return None

    def get_schemas(self, session_id: str) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/EnumSchemas"
        params = {"session": session_id}
        try:
            with requests.Session() as s:
                response = s.get(url, params=params, timeout=15)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"❌ EnumSchemas Error: {e}")
            return []

    def get_vehicles_by_schema(self, session_id: str, schema_id: str) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/EnumDevices"
        params = {"session": session_id, "schemaID": schema_id}
        try:
            with requests.Session() as s:
                response = s.get(url, params=params, timeout=15)
                response.raise_for_status()
                data = response.json()
                if isinstance(data, dict):
                    return data.get("Items", [])
                return data if isinstance(data, list) else []
        except Exception as e:
            logger.error(f"❌ EnumDevices Error: {e}")
            return []

    def get_online_info(self, session_id, schema_id, device_ids):
        url = f"{self.base_url}/GetOnlineInfo"
        params = {"session": session_id, "schemaID": schema_id, "IDs": device_ids}
        try:
            with requests.Session() as s:
                response = s.get(url, params=params, timeout=15)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"❌ GetOnlineInfo Error: {e}")
            return {}

    def get_track_data(self, session_id, schema_id, device_id, start_dt, end_dt):
        """
        Получение сырого трека.
        AutoGRAPH возвращает объект с массивами DT (Time), Speed, и т.д.
        """
        url = f"{self.base_url}/GetTrack"
        params = {
            "session": session_id,
            "schemaID": schema_id,
            "ID": device_id,
            "SD": start_dt,
            "ED": end_dt
        }
        try:
            with requests.Session() as s:
                response = s.get(url, params=params, timeout=30)
                if response.status_code == 200:
                    return response.json()
                return []
        except Exception as e:
            logger.error(f"❌ GetTrack error: {e}")
            return []

    def parse_moto_hours(self, fdt_str: str) -> int:
        try:
            if not fdt_str or fdt_str == '0': return 0
            if '.' in fdt_str:
                days, rest = fdt_str.split('.')
                return int(days) * 24 + (int(rest.split(':')[0]) if ':' in rest else 0)
            return int(fdt_str.split(':')[0]) if ':' in fdt_str else 0
        except:
            return 0

    @staticmethod
    def interpolate_fuel(raw_value, taring_items):
        # Жесткая проверка входных данных на None
        if raw_value is None or taring_items is None or not taring_items:
            return 0.0
        try:
            if raw_value in [127, 125, 4095]:
                return 0.0

            # Очистка таблицы тарировки от пустых значений
            clean_table = [i for i in taring_items if i.get('inputVal') is not None and i.get('outputVal') is not None]
            if not clean_table:
                return 0.0

            sorted_table = sorted(clean_table, key=lambda x: x['inputVal'])
            x = [float(i['inputVal']) for i in sorted_table]
            y = [float(i['outputVal']) for i in sorted_table]
            return float(np.interp(float(raw_value), x, y))
        except Exception as e:
            logger.error(f"Interpolation calculation error: {e}")
            return 0.0