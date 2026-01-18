"""
Инициализация пакета views.
"""
# Экспортируем все views для удобного импорта
from .auth import LoginView, SchemaListView
from .vehicles import VehicleListView, VehicleOnlineView
from .analytics import AnalyticsTrackView
from .legacy import AutoGraphInitView, AutoGraphAnalyticsView

__all__ = [
    'LoginView',
    'SchemaListView',
    'VehicleListView',
    'VehicleOnlineView',
    'AnalyticsTrackView',
    'AutoGraphInitView',
    'AutoGraphAnalyticsView',
]