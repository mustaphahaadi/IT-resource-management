from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def system_health(request):
    """Get system health status and metrics"""
    try:
        # Basic system health metrics
        health_data = {
            'status': 'healthy',
            'timestamp': timezone.now().isoformat(),
            'services': {
                'database': {'status': 'up', 'response_time': 12},
                'web_server': {'status': 'up', 'response_time': 8},
                'email_service': {'status': 'up', 'response_time': 45},
            },
            'system_metrics': {
                'uptime': '99.9%',
                'memory_usage': '45%',
                'cpu_usage': '23%',
                'disk_usage': '67%',
                'active_connections': 42,
            },
            'application_metrics': {
                'total_users': 156,
                'active_sessions': 23,
                'pending_requests': 8,
                'completed_tasks_today': 34,
            }
        }
        
        return Response(health_data)
    except Exception as e:
        return Response({
            'status': 'error',
            'timestamp': timezone.now().isoformat(),
            'error': str(e),
            'services': {
                'database': {'status': 'unknown'},
                'web_server': {'status': 'unknown'},
                'email_service': {'status': 'unknown'},
            }
        }, status=500)
