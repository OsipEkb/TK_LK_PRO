"""
Тестовый скрипт для проверки API TK_LK_PRO.
"""
import requests
import json
import sys

# Конфигурация
BASE_URL = "http://127.0.0.1:8000/api"
CREDENTIALS = {
    "username": "Osipenko",
    "password": "Osipenko"  # Замени на реальный пароль если нужно
}


def print_response(label, response):
    """Красивый вывод ответа"""
    print(f"\n{'=' * 60}")
    print(f"📡 {label}")
    print(f"{'=' * 60}")
    print(f"URL: {response.url}")
    print(f"Статус: {response.status_code}")
    print(f"Время: {response.elapsed.total_seconds():.2f} сек")

    try:
        data = response.json()
        print(f"\n📊 Ответ (первые 500 символов):")
        print(json.dumps(data, ensure_ascii=False, indent=2)[:500])

        # Проверяем структуру ответа
        if response.status_code == 200:
            print(f"\n✅ Успех!")
            if 'session_id' in data:
                print(f"   Session ID: {data['session_id'][:20]}...")
            if 'schemas' in data:
                print(f"   Схем: {len(data['schemas'])}")
            if 'vehicles' in data:
                print(f"   ТС: {len(data['vehicles'])}")
            if 'count' in data:
                print(f"   Количество: {data['count']}")
        else:
            print(f"\n❌ Ошибка в данных")

    except json.JSONDecodeError:
        print(f"\n📝 Ответ (текст):")
        print(response.text[:500])

    return response


def test_old_endpoints():
    """Тестирование старых endpoints"""
    print("\n" + "🎯" * 30)
    print("ТЕСТИРУЕМ СТАРЫЕ ENDPOINTS")
    print("🎯" * 30)

    # 1. Старый /init-data/
    print("\n1. 📨 POST /api/init-data/")
    response = requests.post(
        f"{BASE_URL}/init-data/",
        json=CREDENTIALS,
        timeout=30
    )

    if response.status_code == 200:
        data = response.json()
        session_id = data.get('session_id')
        schema_id = data.get('schema_id')
        vehicles = data.get('vehicles', [])

        print_response("Старый /init-data/", response)

        return session_id, schema_id, vehicles
    else:
        print_response("Старый /init-data/ (ОШИБКА)", response)
        return None, None, []


def test_new_endpoints(session_id, schema_id, vehicles):
    """Тестирование новых endpoints"""
    print("\n" + "🆕" * 30)
    print("ТЕСТИРУЕМ НОВЫЕ ENDPOINTS")
    print("🆕" * 30)

    if not session_id:
        print("❌ Нет session_id, пропускаем новые endpoints")
        return

    # 1. Новый /auth/login/
    print("\n1. 🔐 POST /api/auth/login/")
    response = requests.post(
        f"{BASE_URL}/auth/login/",
        json=CREDENTIALS,
        timeout=10
    )
    print_response("Новый /auth/login/", response)

    # 2. /schemas/
    print("\n2. 📋 GET /api/schemas/")
    response = requests.get(
        f"{BASE_URL}/schemas/",
        params={"session_id": session_id},
        timeout=10
    )
    print_response("/schemas/", response)

    if not schema_id:
        print("❌ Нет schema_id, пропускаем vehicles endpoints")
        return

    # 3. /vehicles/
    print("\n3. 🚚 GET /api/vehicles/")
    response = requests.get(
        f"{BASE_URL}/vehicles/",
        params={"session_id": session_id, "schema_id": schema_id},
        timeout=10
    )
    print_response("/vehicles/", response)

    # 4. /vehicles/online/ (если есть ТС)
    if vehicles:
        # Берем первые 3 ID ТС
        device_ids = [str(v['ID']) for v in vehicles[:3]]
        device_ids_str = ",".join(device_ids)

        print(f"\n4. 📡 GET /api/vehicles/online/ (первые 3 ТС)")
        response = requests.get(
            f"{BASE_URL}/vehicles/online/",
            params={
                "session_id": session_id,
                "schema_id": schema_id,
                "device_ids": device_ids_str
            },
            timeout=10
        )
        print_response("/vehicles/online/", response)
    else:
        print("\n4. 📡 GET /api/vehicles/online/ - нет ТС для теста")

    # 5. /analytics/track/ (если есть ТС)
    if vehicles and len(vehicles) > 0:
        device_id = str(vehicles[0]['ID'])
        print(f"\n5. 📈 GET /api/analytics/track/ (первое ТС: {device_id})")

        # Тестовый период - последние 24 часа
        import datetime
        end = datetime.datetime.now()
        start = end - datetime.timedelta(hours=24)

        response = requests.get(
            f"{BASE_URL}/analytics/track/",
            params={
                "session": session_id,
                "schema_id": schema_id,
                "device_id": device_id,
                "from": start.strftime("%Y-%m-%d %H:%M:%S"),
                "to": end.strftime("%Y-%m-%d %H:%M:%S")
            },
            timeout=30
        )
        print_response("/analytics/track/", response)
    else:
        print("\n5. 📈 GET /api/analytics/track/ - нет ТС для теста")


def test_analytics_old(session_id, schema_id, vehicles):
    """Тестирование старого analytics endpoint"""
    if vehicles and len(vehicles) > 0:
        device_id = str(vehicles[0]['ID'])

        print("\n" + "📊" * 30)
        print("ТЕСТИРУЕМ СТАРЫЙ /analytics/")
        print("📊" * 30)

        import datetime
        end = datetime.datetime.now()
        start = end - datetime.timedelta(hours=24)

        print(f"\n📊 GET /api/analytics/ (первое ТС: {device_id})")
        response = requests.get(
            f"{BASE_URL}/analytics/",
            params={
                "session": session_id,
                "schema_id": schema_id,
                "device_id": device_id,
                "from": start.strftime("%Y-%m-%dT%H:%M"),
                "to": end.strftime("%Y-%m-%dT%H:%M")
            },
            timeout=30
        )
        print_response("Старый /analytics/", response)


def main():
    """Основная функция тестирования"""
    print("\n" + "🚀" * 30)
    print("ТЕСТИРОВАНИЕ API TK_LK_PRO")
    print(f"Базовый URL: {BASE_URL}")
    print(f"Пользователь: {CREDENTIALS['username']}")
    print("🚀" * 30)

    try:
        # Тестируем старые endpoints
        session_id, schema_id, vehicles = test_old_endpoints()

        # Тестируем новые endpoints
        test_new_endpoints(session_id, schema_id, vehicles)

        # Тестируем старый analytics
        test_analytics_old(session_id, schema_id, vehicles)

        print("\n" + "✅" * 30)
        print("ТЕСТИРОВАНИЕ ЗАВЕРШЕНО")
        print("✅" * 30)

    except requests.exceptions.ConnectionError:
        print("\n❌ Ошибка подключения к серверу!")
        print("Убедись что сервер Django запущен: python manage.py runserver")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Неожиданная ошибка: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()