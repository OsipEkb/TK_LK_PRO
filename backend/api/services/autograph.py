import requests
import logging
import numpy as np
from typing import Optional, Dict, List, Any
import json

logger = logging.getLogger(__name__)


class AutoGraphService:
    def __init__(self):
        self.base_url = "https://web.tk-ekat.ru/ServiceJSON"
        self.session = requests.Session()

    def get_session_token(self, user: str, password: str) -> Optional[str]:
        url = f"{self.base_url}/Login"
        params = {"UserName": user, "Password": password}
        try:
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            token = response.text.strip().replace('"', '')
            return token if (token and len(token) > 20) else None
        except Exception as e:
            logger.error(f"❌ Ошибка авторизации: {e}")
            return None

    def get_schemas(self, session_id: str) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/EnumSchemas"
        params = {"session": session_id}
        try:
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"❌ Ошибка получения схем: {e}")
            return []

    def get_vehicles_by_schema(self, session_id: str, schema_id: str) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/EnumDevices"
        params = {"session": session_id, "schemaID": schema_id}
        try:
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            return data.get("Items", [])
        except Exception as e:
            logger.error(f"❌ Ошибка получения ТС: {e}")
            return []

    def get_online_info(self, session_id, schema_id, device_ids):
        url = f"{self.base_url}/GetOnlineInfo"
        params = {"session": session_id, "schemaID": schema_id, "IDs": device_ids}
        try:
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"❌ Ошибка получения онлайн данных: {e}")
            return {}

    def get_track_data(self, session_id, schema_id, device_id, start_dt, end_dt):
        """Запрос данных трека для графиков"""
        url = f"{self.base_url}/GetTrack"
        params = {
            "session": session_id,
            "schemaID": schema_id,
            "ID": device_id,
            "SD": start_dt,  # Исправлено: SD вместо from
            "ED": end_dt  # Исправлено: ED вместо to
        }

        # Логируем запрос
        logger.info(f"GetTrack request: SD={start_dt}, ED={end_dt}")

        try:
            response = self.session.get(url, params=params, timeout=30)

            # Логируем ответ
            logger.info(f"GetTrack response status: {response.status_code}")

            if response.status_code != 200:
                logger.error(f"GetTrack error: {response.text[:200]}")
                return []

            response.raise_for_status()

            # Пробуем распарсить JSON
            try:
                data = response.json()
                logger.info(f"GetTrack JSON parsed successfully")
                return data
            except json.JSONDecodeError as e:
                logger.error(f"GetTrack JSON decode error: {e}")
                logger.error(f"Raw response: {response.text[:200]}")
                return []

        except Exception as e:
            logger.error(f"GetTrack error: {e}")
            return []

    @staticmethod
    def interpolate_fuel(raw_value, taring_items):
        """Интерполяция ДУТ в литры"""
        if not taring_items or raw_value is None or raw_value in [127, 125, 4095]:
            return 0.0
        # Сортировка и расчет через numpy
        sorted_table = sorted(taring_items, key=lambda x: x['inputVal'])
        x = [i['inputVal'] for i in sorted_table]
        y = [i['outputVal'] for i in sorted_table]
        return float(np.interp(raw_value, x, y))

    def parse_moto_hours(self, fdt_str: str) -> int:
        try:
            if not fdt_str or fdt_str == '0': return 0
            if '.' in fdt_str:
                days, rest = fdt_str.split('.')
                return int(days) * 24 + (int(rest.split(':')[0]) if ':' in rest else 0)
            return int(fdt_str.split(':')[0]) if ':' in fdt_str else 0
        except:
            return 0