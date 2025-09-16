from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import SupportRequest, RequestCategory, RequestComment, Alert
from .serializers import SupportRequestSerializer, RequestCategorySerializer, RequestCommentSerializer, AlertSerializer

class SupportRequestViewSet(viewsets.ModelViewSet):
    queryset = SupportRequest.objects.all()
    serializer_class = SupportRequestSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'category', 'assigned_to', 'requester_department']
    search_fields = ['ticket_number', 'title', 'description', 'requester__first_name', 'requester__last_name']
    ordering_fields = ['created_at', 'priority', 'status', 'resolution_due']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        total_requests = SupportRequest.objects.count()
        open_requests = SupportRequest.objects.filter(status__in=['open', 'assigned', 'in_progress']).count()
        critical_requests = SupportRequest.objects.filter(priority='critical', status__in=['open', 'assigned', 'in_progress']).count()
        overdue_requests = SupportRequest.objects.filter(
            resolution_due__lt=timezone.now(),
            status__in=['open', 'assigned', 'in_progress']
        ).count()
        
        return Response({
            'total_requests': total_requests,
            'open_requests': open_requests,
            'critical_requests': critical_requests,
            'overdue_requests': overdue_requests,
        })

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        support_request = self.get_object()
        assigned_to_id = request.data.get('assigned_to')
        
        if assigned_to_id:
            from django.contrib.auth.models import User
            try:
                user = User.objects.get(id=assigned_to_id)
                support_request.assigned_to = user
                support_request.status = 'assigned'
                support_request.assigned_at = timezone.now()
                support_request.save()
                
                return Response({'message': 'Request assigned successfully'})
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'error': 'assigned_to is required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        support_request = self.get_object()
        comment_text = request.data.get('comment')
        is_internal = request.data.get('is_internal', False)
        
        if comment_text:
            comment = RequestComment.objects.create(
                request=support_request,
                author=request.user,
                comment=comment_text,
                is_internal=is_internal
            )
            serializer = RequestCommentSerializer(comment)
            return Response(serializer.data)
        
        return Response({'error': 'comment is required'}, status=status.HTTP_400_BAD_REQUEST)

class RequestCategoryViewSet(viewsets.ModelViewSet):
    queryset = RequestCategory.objects.all()
    serializer_class = RequestCategorySerializer

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['alert_type', 'is_acknowledged']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        alert = self.get_object()
        alert.is_acknowledged = True
        alert.acknowledged_by = request.user
        alert.acknowledged_at = timezone.now()
        alert.save()
        
        return Response({'message': 'Alert acknowledged successfully'})
