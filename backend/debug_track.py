"""
Отладка запроса трека к AutoGRAPH API.
"""
import requests
import json

# Параметры из теста
session_id = "478EEE7A69CCFF1074507148CBC04B207A4E944147E02AF8467F6E4C257D32BCAEB9AD87D170CB79A470B7D250737A4E02A553D2071A176550D4FC72C1222FAF2545A461D6342AD03B34405851372646BD95C4197BB846959DF32B7959F70CA02588FA6B52574466D253099B11D7362EA64D16D25A0C9381D293BD8F6F8600A3C8993921262ADC7BC6E44BFDE994548C"
schema_id = "fad66447-fe18-4a2a-a7b9-945eab775fda"
device_id = "11804e75-d2c3-4f2b-9107-5ad899adfe12"
date_from = "2026-01-17 09:56:50"
date_to = "2026-01-18 09:56:50"


# Форматируем даты как в старом коде
def format_date_for_autograph(date_str):
    """Форматирование даты для AutoGRAPH API"""
    # Убираем тире, двоеточия, пробелы
    cleaned = date_str.replace('-', '').replace(':', '').replace(' ', '')
    # Формат: YYYYMMDD-HHMM
    return f"{cleaned[:8]}-{cleaned[8:12]}"


from_date = format_date_for_autograph(date_from)
to_date = format_date_for_autograph(date_to)

print(f"Параметры запроса:")
print(f"Session ID: {session_id[:50]}...")
print(f"Schema ID: {schema_id}")
print(f"Device ID: {device_id}")
print(f"From (formatted): {from_date}")
print(f"To (formatted): {to_date}")

# Пробуем сделать запрос напрямую
url = "https://web.tk-ekat.ru/ServiceJSON/GetTrack"
params = {
    "session": session_id,
    "schemaID": schema_id,
    "ID": device_id,
    "from": from_date,
    "to": to_date
}

print(f"\nЗапрос URL: {url}")
print(f"Параметры: {params}")

try:
    response = requests.get(url, params=params, timeout=30)
    print(f"\nСтатус ответа: {response.status_code}")
    print(f"Заголовки: {dict(response.headers)}")
    print(f"\nОтвет (первые 1000 символов):")
    print(response.text[:1000])

    if response.status_code == 200:
        try:
            data = response.json()
            print(f"\nJSON успешно распарсен")
            print(f"Тип данных: {type(data)}")
            if isinstance(data, dict):
                print(f"Ключи: {list(data.keys())}")
                if device_id in data:
                    print(
                        f"Данные для устройства {device_id}: {data[device_id][:2] if isinstance(data[device_id], list) else data[device_id]}")
        except json.JSONDecodeError as e:
            print(f"\nОшибка парсинга JSON: {e}")
            print(f"Сырой ответ: {response.text[:500]}")
    else:
        print(f"\nОшибка HTTP: {response.status_code}")
        print(f"Текст ошибки: {response.text[:500]}")

except Exception as e:
    print(f"\nОшибка запроса: {e}")
    import traceback

    traceback.print_exc()