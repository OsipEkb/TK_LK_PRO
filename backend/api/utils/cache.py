"""
Утилиты для кэширования.
Использует встроенный Django кэш (LocMemCache по умолчанию).
"""
from django.core.cache import cache
from functools import wraps
import hashlib


def cache_result(timeout=300):
    """
    Декоратор для кэширования результатов функций.

    Пример использования:
    @cache_result(timeout=60)
    def get_vehicles(session_id, schema_id):
        # ...
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Создаем уникальный ключ кэша
            cache_key = f"{func.__module__}.{func.__name__}:{hashlib.md5(str(args).encode() + str(kwargs).encode()).hexdigest()}"

            # Проверяем кэш
            cached = cache.get(cache_key)
            if cached is not None:
                return cached

            # Выполняем функцию
            result = func(*args, **kwargs)

            # Сохраняем в кэш
            cache.set(cache_key, result, timeout)

            return result

        return wrapper

    return decorator


def get_cache_key(prefix, *args):
    """Генерация ключа кэша"""
    parts = [prefix] + [str(arg) for arg in args]
    return f"{':'.join(parts)}"


def clear_cache_pattern(pattern):
    """
    Очистка кэша по паттерну.
    Внимание: для LocMemCache очищает весь кэш!
    """
    cache.clear()