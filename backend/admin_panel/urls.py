from django.urls import path
from . import views

urlpatterns = [
    # Backup & Export endpoints
    path('backup/history/', views.backup_history, name='admin_backup_history'),
    path('backup/create/', views.backup_create, name='admin_backup_create'),
    path('backup/<int:backup_id>/', views.backup_delete, name='admin_backup_delete'),
    path('backup/<int:backup_id>/restore/', views.backup_restore, name='admin_backup_restore'),
    path('backup/<int:backup_id>/download/', views.backup_download, name='admin_backup_download'),
    path('export/', views.export_data, name='admin_export'),

    # System Settings
    path('settings/', views.admin_settings, name='admin_settings'),

    # Audit Logs
    path('audit-logs/', views.audit_logs, name='admin_audit_logs'),
]
