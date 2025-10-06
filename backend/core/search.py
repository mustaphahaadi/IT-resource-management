from rest_framework.decorators import api_view, permission_classes
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .bulk_operations import AdvancedSearchService


@extend_schema(request=None, responses=OpenApiResponse(description='Global search across models'))
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def global_search(request):
    query = (request.GET.get('q') or '').strip()
    limit = int(request.GET.get('limit', 25))

    if len(query) < 2:
        return Response({'error': 'Query must be at least 2 characters long'}, status=400)

    try:
        results = AdvancedSearchService.global_search(query, request.user, limit=limit)
        return Response({
            'query': query,
            'results': results
        })
    except Exception as exc:
        return Response({'error': f'Failed to execute search: {exc}'}, status=500)
