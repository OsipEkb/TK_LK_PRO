"""
Маршруты API.
Добавляем новые endpoints, сохраняя старые.
"""
from django.urls import path

# Импортируем новые views
from .views.auth import LoginView, SchemaListView
from .views.vehicles import VehicleListView, VehicleOnlineView
# Убираем VehicleDetailView пока его нет
from .views.analytics import AnalyticsTrackView

# Импортируем старые views для обратной совместимости
from .views.legacy import AutoGraphInitView, AutoGraphAnalyticsView

urlpatterns = [
    # Новые endpoints (рекомендуемые)
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('schemas/', SchemaListView.as_view(), name='schemas_list'),
    path('vehicles/', VehicleListView.as_view(), name='vehicles_list'),
    path('vehicles/online/', VehicleOnlineView.as_view(), name='vehicles_online'),
    path('analytics/track/', AnalyticsTrackView.as_view(), name='analytics_track'),

    # Старые endpoints (для обратной совместимости)
    path('init-data/', AutoGraphInitView.as_view(), name='init_data'),
    path('analytics/', AutoGraphAnalyticsView.as_view(), name='analytics'),
]