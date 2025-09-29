from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BulkOperationViewSet, SearchViewSet, ReportingViewSet, 
    ActivityLogViewSet, import_equipment_data, system_health
)

router = DefaultRouter()
router.register(r'bulk-operations', BulkOperationViewSet, basename='bulk-operations')
router.register(r'search', SearchViewSet, basename='search')
router.register(r'reports', ReportingViewSet, basename='reports')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-logs')

urlpatterns = [
    path('', include(router.urls)),
    path('import/equipment/', import_equipment_data, name='import-equipment'),
    path('system/health/', system_health, name='system-health'),
]
