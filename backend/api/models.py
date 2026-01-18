from django.db import models


class Vehicle(models.Model):
    """Модель транспортного средства."""
    name = models.CharField("Название ТС", max_length=100)
    device_id = models.CharField("ID прибора (из AutoGRAPH)", max_length=100, unique=True)

    # Настройки для ИИ
    expected_consumption_idle = models.FloatField("Расход на стоянке (л/ч)", default=2.0)
    expected_consumption_move = models.FloatField("Расход в движении (л/100км)", default=25.0)

    # Чтобы знать, сколько датчиков мы ожидаем
    sensors_count = models.IntegerField("Количество ДУТ", default=1)

    def __str__(self):
        return f"{self.name} ({self.device_id})"


class FuelEvent(models.Model):
    """События, найденные ИИ: сливы, заправки, перерасходы."""
    EVENT_TYPES = [
        ('drain', 'Слив'),
        ('refill', 'Заправка'),
        ('overrun', 'Перерасход'),
        ('error', 'Сбой датчика'),
    ]

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=10, choices=EVENT_TYPES)
    timestamp = models.DateTimeField("Время события")
    volume = models.FloatField("Объем (литры)")
    is_confirmed = models.BooleanField("Подтверждено пользователем", default=False)

    def __str__(self):
        return f"{self.get_event_type_display()} на {self.vehicle.name}"


class SupportTicket(models.Model):
    """Обращения в техподдержку."""
    email = models.EmailField("Email для ответа")
    subject = models.CharField("Тема", max_length=200)
    message = models.TextField("Сообщение")
    created_at = models.DateTimeField(auto_now_add=True)
    is_closed = models.BooleanField(default=False)
