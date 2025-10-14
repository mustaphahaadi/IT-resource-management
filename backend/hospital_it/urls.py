from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from core.reports import report_generate, report_history, report_download, report_schedule
from core.files import file_upload

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/inventory/', include('inventory.urls')),
    path('api/requests/', include('requests_system.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/auth/', include('authentication.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/core/', include('core.urls')),
    path('api/admin/', include('admin_panel.urls')),
    path('api/knowledge-base/', include('knowledge_base.urls')),

    # Shortcuts to core endpoints expected by frontend
    path('api/reports/generate/', report_generate, name='reports_generate'),
    path('api/reports/history/', report_history, name='reports_history'),
    path('api/reports/<int:report_id>/download/', report_download, name='reports_download'),
    path('api/reports/schedule/', report_schedule, name='reports_schedule'),
    path('api/files/upload/', file_upload, name='file_upload'),

    # API Schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Optional UI:
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
