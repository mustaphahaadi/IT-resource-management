from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from django.contrib.auth.views import LogoutView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.http import HttpResponse
from django.utils import timezone

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    # Expose flags needed by the frontend
    is_superuser = serializers.BooleanField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)
    is_approved = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'permissions', 'role', 'is_superuser', 'is_staff', 'is_approved'
        ]
    
    def get_permissions(self, obj):
        return list(obj.user_permissions.values_list('codename', flat=True))
    
    def get_role(self, obj):
        if hasattr(obj, 'role') and obj.role:
            return obj.role
        elif obj.is_superuser:
            return 'admin'
        elif obj.groups.filter(name='IT Staff').exists():
            return 'staff'
        else:
            return 'user'

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    request.user.auth_token.delete()
    return Response({'message': 'Logged out successfully'})

# --- Admin Backup & Export stub endpoints (to avoid 404s from frontend) ---

# In-memory store for backups (stub). In production, replace with a proper model.
BACKUPS_STORE = []
BACKUP_AUTO_ID = 1

def _next_backup_id():
    global BACKUP_AUTO_ID
    bid = BACKUP_AUTO_ID
    BACKUP_AUTO_ID += 1
    return bid

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def backup_history(request):
    return Response(BACKUPS_STORE)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def backup_create(request):
    new_id = _next_backup_id()
    filename = f"backup_{timezone.now().strftime('%Y%m%d_%H%M%S')}.zip"
    backup = {
        'id': new_id,
        'filename': filename,
        'size': 1024 * 1024,  # 1MB stub
        'created_at': timezone.now().isoformat(),
        'type': 'full',
        'status': 'completed',
        'created_by': request.user.get_username() if request.user and request.user.is_authenticated else 'system',
    }
    BACKUPS_STORE.insert(0, backup)
    return Response({'message': 'Backup created', 'backup': backup})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def backup_delete(request, backup_id: int):
    global BACKUPS_STORE
    BACKUPS_STORE = [b for b in BACKUPS_STORE if b.get('id') != backup_id]
    return Response(status=204)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def backup_restore(request, backup_id: int):
    # Stub: pretend to restore
    return Response({'message': f'Restore initiated for backup {backup_id}'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def backup_download(request, backup_id: int):
    # Return a small text payload as a downloadable file placeholder
    content = f"Stub backup archive for backup_id={backup_id} generated at {timezone.now().isoformat()}\n".encode('utf-8')
    response = HttpResponse(content, content_type='application/octet-stream')
    response['Content-Disposition'] = f'attachment; filename="backup_{backup_id}.zip"'
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_data(request):
    fmt = (request.data or {}).get('format', 'csv').lower()
    timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
    if fmt == 'json':
        # Simple JSON export
        return Response({'exported_at': timezone.now().isoformat(), 'data': []})
    # Default to CSV or any other format -> serve CSV text
    csv_content = 'type,count\nrequests,0\ntasks,0\n'.encode('utf-8')
    response = HttpResponse(csv_content, content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="hospital_it_export_{timestamp}.csv"'
    return response

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/inventory/', include('inventory.urls')),
    path('api/requests/', include('requests_system.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/auth/', include('authentication.urls')),
    path('api/auth/', include('rest_framework.urls')),
    path('api/auth/user/', user_profile, name='api_user_profile'),
    path('api/notifications/', include('notifications.urls')),
    path('api/analytics/', include('analytics.urls')),
    # Reports stubs
    path('api/reports/generate/', lambda request: report_generate(request), name='reports_generate'),
    path('api/reports/history/', lambda request: report_history(request), name='reports_history'),
    path('api/reports/<int:report_id>/download/', lambda request, report_id: report_download(request, report_id), name='reports_download'),
    path('api/reports/schedule/', lambda request: report_schedule(request), name='reports_schedule'),
    # Admin backup & export routes (stubs)
    path('api/admin/backup/history/', backup_history, name='admin_backup_history'),
    path('api/admin/backup/create/', backup_create, name='admin_backup_create'),
    path('api/admin/backup/<int:backup_id>/', backup_delete, name='admin_backup_delete'),
    path('api/admin/backup/<int:backup_id>/restore/', backup_restore, name='admin_backup_restore'),
    path('api/admin/backup/<int:backup_id>/download/', backup_download, name='admin_backup_download'),
    path('api/admin/export/', export_data, name='admin_export'),
    # Admin settings stub
    path('api/admin/settings/', lambda request: admin_settings(request), name='admin_settings'),
    # Audit logs stub
    path('api/admin/audit-logs/', lambda request: audit_logs(request), name='admin_audit_logs'),
    # Search stub
    path('api/search/', lambda request: global_search(request), name='global_search'),
    # Files upload stub
    path('api/files/upload/', lambda request: file_upload(request), name='file_upload'),
]

# --- Report stubs ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_generate(request):
    payload = request.data or {}
    fmt = (payload.get('format') or 'pdf').lower()
    rid = int(timezone.now().strftime('%H%M%S'))
    download_url = f"/api/reports/{rid}/download/?format={fmt}"
    return Response({'message': 'Report generation started', 'download_url': download_url})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_history(request):
    # Return empty history stub
    return Response({'results': []})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_download(request, report_id: int):
    fmt = (request.GET.get('format') or 'pdf').lower()
    if fmt == 'csv':
        content = 'section,value\nsummary,ok\n'.encode('utf-8')
        resp = HttpResponse(content, content_type='text/csv')
        resp['Content-Disposition'] = f'attachment; filename="report_{report_id}.csv"'
        return resp
    elif fmt == 'json':
        return Response({'report_id': report_id, 'generated_at': timezone.now().isoformat(), 'data': {}})
    # default PDF placeholder
    content = b'%PDF-1.4\n% stub pdf content\n'
    resp = HttpResponse(content, content_type='application/pdf')
    resp['Content-Disposition'] = f'attachment; filename="report_{report_id}.pdf"'
    return resp

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_schedule(request):
    return Response({'message': 'Report scheduled successfully'})

# --- Admin settings stub ---
SETTINGS_STORE = {
    'site_name': 'Hospital IT System',
    'maintenance_mode': False,
    'default_timezone': 'UTC',
}

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def admin_settings(request):
    global SETTINGS_STORE
    if request.method == 'GET':
        return Response(SETTINGS_STORE)
    # PATCH
    data = request.data or {}
    SETTINGS_STORE.update({k: v for k, v in data.items() if k in SETTINGS_STORE})
    return Response(SETTINGS_STORE)

# --- Audit logs stub ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def audit_logs(request):
    return Response({'results': []})

# --- Global search stub ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def global_search(request):
    q = request.GET.get('q', '')
    return Response({'query': q, 'results': []})

# --- Files upload stub ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def file_upload(request):
    uploaded = request.FILES.get('file')
    if not uploaded:
        return Response({'error': 'file is required'}, status=400)
    return Response({
        'filename': uploaded.name,
        'size': uploaded.size,
        'content_type': getattr(uploaded, 'content_type', 'application/octet-stream'),
        'uploaded_at': timezone.now().isoformat(),
    })
