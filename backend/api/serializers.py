"""
Сериализаторы для API AutoGRAPH.
Основаны на реальной структуре ответов от AutoGRAPH API.
"""
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    """Сериализатор для входа в AutoGRAPH"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class AnalyticsRequestSerializer(serializers.Serializer):
    """Сериализатор для запроса аналитики"""
    session = serializers.CharField(required=True)
    schema_id = serializers.CharField(required=True)
    device_id = serializers.CharField(required=True)
    from_date = serializers.CharField(required=True)  # Простое имя
    to = serializers.CharField(required=True)

    def validate(self, data):
        """Простая проверка: начальная дата должна быть раньше конечной"""
        if data['from_date'] >= data['to']:
            raise serializers.ValidationError({
                "from_date": "Начальная дата должна быть раньше конечной"
            })

        return data