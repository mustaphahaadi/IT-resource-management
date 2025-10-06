from rest_framework.decorators import api_view, permission_classes
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

@extend_schema(request=None, responses=OpenApiResponse(description='Upload a file'))
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
