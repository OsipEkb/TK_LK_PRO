"""
Кастомные исключения и обработчик ошибок для API.
"""
import traceback
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings


def custom_exception_handler(exc, context):
    """
    Кастомный обработчик исключений.
    Возвращает структурированные ошибки.
    """
    # Получаем стандартный response
    response = exception_handler(exc, context)

    if response is not None:
        # Форматируем ошибку
        error_data = {
            'error': True,
            'message': str(exc),
            'code': response.status_code,
        }

        # Добавляем детали для 400 ошибок
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            error_data['details'] = response.data

        response.data = error_data

    return response


class APIException(Exception):
    """Базовое исключение API"""

    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)