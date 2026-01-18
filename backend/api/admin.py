from django.contrib import admin
from .models import Vehicle, FuelEvent, SupportTicket

# Мы регистрируем модели, чтобы Django создал для них интерфейс в админке.
# Теперь ты сможешь добавлять, удалять и редактировать записи через браузер.

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('name', 'device_id', 'sensors_count') # Колонки в списке
    search_fields = ('name', 'device_id')               # Поле поиска

@admin.register(FuelEvent)
class FuelEventAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'event_type', 'timestamp', 'volume', 'is_confirmed')
    list_filter = ('event_type', 'is_confirmed')        # Фильтры справа

@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('subject', 'email', 'created_at', 'is_closed')