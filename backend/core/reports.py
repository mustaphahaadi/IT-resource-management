from rest_framework.decorators import api_view, permission_classes
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone

@extend_schema(request=None, responses=OpenApiResponse(description='Start asynchronous report generation'))
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_generate(request):
    payload = request.data or {}
    fmt = (payload.get('format') or 'pdf').lower()
    rid = int(timezone.now().strftime('%H%M%S'))
    download_url = f"/api/reports/{rid}/download/?format={fmt}"
    return Response({'message': 'Report generation started', 'download_url': download_url})

@extend_schema(request=None, responses=OpenApiResponse(description='List generated reports'))
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_history(request):
    # Return empty history stub
    return Response({'results': []})

@extend_schema(request=None, responses=OpenApiResponse(description='Download generated report'))
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

@extend_schema(request=None, responses=OpenApiResponse(description='Schedule periodic report generation'))
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_schedule(request):
    return Response({'message': 'Report scheduled successfully'})
