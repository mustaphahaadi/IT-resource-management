from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BulkOperationViewSet, SearchViewSet, ReportingViewSet, 
    ActivityLogViewSet, import_equipment_data, system_health
)
from .reports import report_generate, report_history, report_download, report_schedule
from .search import global_search
from .files import file_upload

router = DefaultRouter()
router.register(r'bulk-operations', BulkOperationViewSet, basename='bulk-operations')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-logs')

urlpatterns = [
    path('', include(router.urls)),
    path('import/equipment/', import_equipment_data, name='import-equipment'),
    path('system/health/', system_health, name='system-health'),

    # Reports stubs
    path('reports/generate/', report_generate, name='reports_generate'),
    path('reports/history/', report_history, name='reports_history'),
    path('reports/<int:report_id>/download/', report_download, name='reports_download'),
    path('reports/schedule/', report_schedule, name='reports_schedule'),

    # Search stub
    path('search/', global_search, name='global_search'),

    # Files upload stub
    path('files/upload/', file_upload, name='file_upload'),
]
