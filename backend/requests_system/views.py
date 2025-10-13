from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import SupportRequest, RequestCategory, RequestComment, Alert
from .serializers import SupportRequestSerializer, RequestCategorySerializer, RequestCommentSerializer, AlertSerializer
from authentication.permissions import IsOwnerOrStaff, IsStaffOrReadOnly, RoleBasedPermission
from core.workflow_engine import WorkflowEngine
from core.notification_service import WorkflowNotifications

class SupportRequestViewSet(viewsets.ModelViewSet):
    queryset = SupportRequest.objects.all()
    serializer_class = SupportRequestSerializer
    permission_classes = [RoleBasedPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'category', 'assigned_to', 'requester_department']
    search_fields = ['ticket_number', 'title', 'description', 'requester__first_name', 'requester__last_name']
    ordering_fields = ['created_at', 'priority', 'status', 'resolution_due']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter requests based on user role (aligned with RoleBasedPermission roles)."""
        queryset = SupportRequest.objects.all()
        user = self.request.user
        
        if not user or not user.is_authenticated:
            return SupportRequest.objects.none()
        
        # System admin and IT manager can see all requests
        if getattr(user, 'role', '') in ['system_admin', 'it_manager'] or user.is_staff:
            return queryset
        
        from django.db import models
        # Technicians (including senior technicians) can see department + IT + own
        if getattr(user, 'role', '') in ['technician', 'senior_technician']:
            return queryset.filter(
                models.Q(requester=user) |
                models.Q(assigned_to=user) |
                models.Q(requester__department__iexact=getattr(user, 'department', '')) |
                models.Q(requester__department__iexact='it')
            )
        
        # Regular end users: only their own requests
        return queryset.filter(requester=user)
    
    def perform_create(self, serializer):
        """Set the requester to the current user when creating a request."""
        request = serializer.save(requester=self.request.user)
        
        # Process through workflow engine
        WorkflowEngine.process_new_request(request)
        
        # Send workflow notifications
        WorkflowNotifications.request_created(request)
        
        return request

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
            from django.contrib.auth import get_user_model
            UserModel = get_user_model()
            try:
                user = UserModel.objects.get(id=assigned_to_id)
                support_request.assigned_to = user
                support_request.status = 'assigned'
                support_request.assigned_at = timezone.now()
                support_request.save()
                
                # Create task if needed
                if WorkflowEngine._should_create_task(support_request):
                    task = WorkflowEngine._create_task_from_request(support_request)
                    if task:
                        # Try to assign task to same user
                        try:
                            from tasks.models import ITPersonnel
                            from tasks.services import TaskAssignmentService
                            technician = ITPersonnel.objects.get(user=user)
                            TaskAssignmentService.assign_task_to_technician(
                                task, technician, assigned_by=request.user
                            )
                        except ITPersonnel.DoesNotExist:
                            pass
                
                return Response({'message': 'Request assigned successfully'})
            except UserModel.DoesNotExist:
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
    permission_classes = [IsStaffOrReadOnly]

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    permission_classes = [RoleBasedPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['alert_type', 'is_acknowledged']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter alerts based on user role (aligned with RoleBasedPermission roles)."""
        queryset = Alert.objects.all()
        user = self.request.user
        
        if not user or not user.is_authenticated:
            return Alert.objects.none()
        
        # System admin and IT manager can see all alerts
        if getattr(user, 'role', '') in ['system_admin', 'it_manager'] or user.is_staff:
            return queryset
        
        # Technicians (incl. senior technicians) can see relevant alerts + own
        if getattr(user, 'role', '') in ['technician', 'senior_technician']:
            from django.db import models
            return queryset.filter(
                models.Q(alert_type__in=['equipment_failure', 'maintenance_due', 'system_alert']) |
                models.Q(created_by=user)
            )
        
        # Regular end users see only their own alerts
        return queryset.filter(created_by=user)

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        alert = self.get_object()
        alert.is_acknowledged = True
        alert.acknowledged_by = request.user
        alert.acknowledged_at = timezone.now()
        alert.save()
        
        return Response({'message': 'Alert acknowledged successfully'})



@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def choices(request):
    """Return choice lists for SupportRequest dropdowns (priority, status, channel)."""
    try:
        priorities = [{'value': k, 'label': v} for k, v in SupportRequest.PRIORITY_CHOICES]
        statuses = [{'value': k, 'label': v} for k, v in SupportRequest.STATUS_CHOICES]
        channels = [{'value': k, 'label': v} for k, v in SupportRequest.CHANNEL_CHOICES]
        return Response({
            'priorities': priorities,
            'statuses': statuses,
            'channels': channels,
        })
    except Exception as e:
        return Response({'error': 'Failed to load choices', 'details': str(e)}, status=500)
