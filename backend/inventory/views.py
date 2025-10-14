from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from django.utils import timezone
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from .models import (
    Equipment, Software, Department, Location, Vendor, EquipmentCategory, 
    MaintenanceSchedule, AssetHistory, AssetCheckout, AssetAudit, 
    AssetAuditItem, AssetAlert, AssetTag
)
from .serializers import (
    EquipmentSerializer, SoftwareSerializer, DepartmentSerializer,
    LocationSerializer, VendorSerializer, EquipmentCategorySerializer,
    MaintenanceScheduleSerializer, AssetHistorySerializer, AssetCheckoutSerializer,
    AssetAuditSerializer, AssetAuditItemSerializer, AssetAlertSerializer, AssetTagSerializer
)
from authentication.permissions import IsStaffOrReadOnly, IsAdminOrStaff, DepartmentBasedPermission, RoleBasedPermission
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from rest_framework.response import Response

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    permission_classes = [RoleBasedPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'location', 'priority']
    search_fields = ['name', 'asset_tag', 'serial_number', 'model', 'manufacturer']
    ordering_fields = ['name', 'created_at', 'warranty_expiry']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter equipment based on user role and department with strict access control."""
        queryset = Equipment.objects.all()
        user = self.request.user
        
        if not user or not user.is_authenticated:
            return Equipment.objects.none()
        
        # Only approved users can access inventory
        if not getattr(user, 'is_approved', False) and getattr(user, 'role', '') != 'system_admin':
            return Equipment.objects.none()
        
        # System admin and IT manager can see all equipment
        if getattr(user, 'role', '') in ['system_admin', 'it_manager'] or user.is_staff:
            return queryset
        
        # Senior technicians and technicians can see department + IT equipment
        if getattr(user, 'role', '') in ['technician', 'senior_technician']:
            return queryset.filter(
                models.Q(location__department__name__iexact=getattr(user, 'department', '')) |
                models.Q(location__department__name__iexact='it')
            )
        
        # End users have no access to inventory (removed basic access)
        return Equipment.objects.none()

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        queryset = self.get_queryset()
        total_equipment = queryset.count()
        active_equipment = queryset.filter(status='active').count()
        maintenance_equipment = queryset.filter(status='maintenance').count()
        critical_equipment = queryset.filter(priority='critical').count()
        checked_out_equipment = queryset.filter(status='checked_out').count()
        overdue_maintenance = queryset.filter(
            next_maintenance_date__lt=timezone.now().date()
        ).count()
        warranty_expiring = queryset.filter(
            warranty_expiry__lte=timezone.now().date() + timezone.timedelta(days=30),
            warranty_expiry__gte=timezone.now().date()
        ).count()
        warranty_expired = queryset.filter(
            warranty_expiry__lt=timezone.now().date()
        ).count()
        
        return Response({
            'total_equipment': total_equipment,
            'active_equipment': active_equipment,
            'maintenance_equipment': maintenance_equipment,
            'critical_equipment': critical_equipment,
            'checked_out_equipment': checked_out_equipment,
            'overdue_maintenance': overdue_maintenance,
            'warranty_expiring': warranty_expiring,
            'warranty_expired': warranty_expired,
        })
    
    @action(detail=True, methods=['post'])
    def check_out(self, request, pk=None):
        """Check out equipment to a user"""
        equipment = self.get_object()
        user_id = request.data.get('user_id')
        expected_return_date = request.data.get('expected_return_date')
        notes = request.data.get('notes', '')
        
        if not user_id:
            return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if equipment.status == 'checked_out':
            return Response({'error': 'Equipment is already checked out'}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Create checkout record
        checkout = AssetCheckout.objects.create(
            equipment=equipment,
            checked_out_to=user,
            checked_out_by=request.user,
            expected_return_date=expected_return_date,
            checkout_notes=notes,
            condition_at_checkout=equipment.condition
        )
        
        # Update equipment
        equipment.check_out(user, expected_return_date)
        
        # Create history record
        AssetHistory.objects.create(
            equipment=equipment,
            action='checked_out',
            user=request.user,
            new_value=f'Checked out to {user.get_full_name()}',
            notes=notes,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({'message': 'Equipment checked out successfully'})
    
    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        """Check in equipment"""
        equipment = self.get_object()
        notes = request.data.get('notes', '')
        condition = request.data.get('condition', equipment.condition)
        
        if equipment.status != 'checked_out':
            return Response({'error': 'Equipment is not checked out'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update checkout record
        checkout = AssetCheckout.objects.filter(
            equipment=equipment,
            actual_return_date__isnull=True
        ).first()
        
        if checkout:
            checkout.actual_return_date = timezone.now()
            checkout.checked_in_by = request.user
            checkout.checkin_notes = notes
            checkout.condition_at_checkin = condition
            checkout.save()
        
        # Update equipment
        equipment.condition = condition
        equipment.check_in()
        
        # Create history record
        AssetHistory.objects.create(
            equipment=equipment,
            action='checked_in',
            user=request.user,
            new_value=f'Checked in by {request.user.get_full_name()}',
            notes=notes,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({'message': 'Equipment checked in successfully'})
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get equipment history"""
        equipment = self.get_object()
        history = AssetHistory.objects.filter(equipment=equipment)
        serializer = AssetHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def qr_code(self, request, pk=None):
        """Get equipment QR code"""
        equipment = self.get_object()
        if equipment.qr_code:
            response = HttpResponse(equipment.qr_code.read(), content_type='image/png')
            response['Content-Disposition'] = f'inline; filename="{equipment.asset_tag}_qr.png"'
            return response
        return Response({'error': 'QR code not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def scan(self, request):
        """Scan equipment by QR code, barcode, or RFID"""
        scan_data = request.data.get('scan_data')
        scan_type = request.data.get('scan_type', 'qr')  # qr, barcode, rfid
        
        if not scan_data:
            return Response({'error': 'Scan data is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            if scan_type == 'qr':
                # Parse QR code data
                import json
                qr_data = json.loads(scan_data.replace("'", '"'))
                equipment = Equipment.objects.get(asset_tag=qr_data.get('asset_tag'))
            elif scan_type == 'barcode':
                equipment = Equipment.objects.get(barcode=scan_data)
            elif scan_type == 'rfid':
                equipment = Equipment.objects.get(rfid_tag=scan_data)
            else:
                # Try to find by asset tag
                equipment = Equipment.objects.get(asset_tag=scan_data)
            
            serializer = EquipmentSerializer(equipment)
            return Response(serializer.data)
        
        except Equipment.DoesNotExist:
            return Response({'error': 'Equipment not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def alerts(self, request):
        """Get active alerts for equipment"""
        queryset = self.get_queryset()
        alerts = AssetAlert.objects.filter(
            equipment__in=queryset,
            is_active=True
        ).order_by('-created_at')
        
        serializer = AssetAlertSerializer(alerts, many=True)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """Create equipment and log the action"""
        equipment = serializer.save()
        
        # Create history record for equipment creation
        AssetHistory.objects.create(
            equipment=equipment,
            action='created',
            user=self.request.user,
            new_value=f'Equipment created: {equipment.name}',
            notes=f'Created by {self.request.user.get_full_name()}',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    def perform_update(self, serializer):
        """Update equipment and log the changes"""
        old_equipment = self.get_object()
        old_values = {
            'name': old_equipment.name,
            'status': old_equipment.status,
            'condition': old_equipment.condition,
            'location': str(old_equipment.location),
            'assigned_to': old_equipment.assigned_to.get_full_name() if old_equipment.assigned_to else None
        }
        
        equipment = serializer.save()
        
        # Track what changed
        changes = []
        if old_values['name'] != equipment.name:
            changes.append(f"Name: {old_values['name']} → {equipment.name}")
        if old_values['status'] != equipment.status:
            changes.append(f"Status: {old_values['status']} → {equipment.status}")
        if old_values['condition'] != equipment.condition:
            changes.append(f"Condition: {old_values['condition']} → {equipment.condition}")
        if str(old_equipment.location) != str(equipment.location):
            changes.append(f"Location: {old_values['location']} → {str(equipment.location)}")
        
        assigned_to_new = equipment.assigned_to.get_full_name() if equipment.assigned_to else None
        if old_values['assigned_to'] != assigned_to_new:
            changes.append(f"Assigned to: {old_values['assigned_to'] or 'None'} → {assigned_to_new or 'None'}")
        
        if changes:
            # Create history record for equipment update
            AssetHistory.objects.create(
                equipment=equipment,
                action='updated',
                user=self.request.user,
                old_value='; '.join([f"{k}: {v}" for k, v in old_values.items()]),
                new_value='; '.join(changes),
                notes=f'Updated by {self.request.user.get_full_name()}',
                ip_address=self.request.META.get('REMOTE_ADDR')
            )



@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def choices(request):
    """Return choice lists for equipment dropdowns (status, condition, priority, maintenance freq, audit types)."""
    try:
        from .models import Equipment, MaintenanceSchedule, AssetAudit, AssetAuditItem

        status_opts = [{'value': k, 'label': v} for k, v in Equipment.STATUS_CHOICES]
        condition_opts = [{'value': k, 'label': v} for k, v in Equipment.CONDITION_CHOICES]
        priority_opts = [{'value': k, 'label': v} for k, v in Equipment.PRIORITY_CHOICES]
        freq_opts = [{'value': k, 'label': v} for k, v in MaintenanceSchedule.FREQUENCY_CHOICES]
        audit_type_opts = [{'value': k, 'label': v} for k, v in AssetAudit.AUDIT_TYPE_CHOICES]
        audit_status_opts = [{'value': k, 'label': v} for k, v in AssetAudit.AUDIT_STATUS_CHOICES]

        return Response({
            'equipment_status': status_opts,
            'equipment_condition': condition_opts,
            'equipment_priority': priority_opts,
            'maintenance_frequency': freq_opts,
            'audit_types': audit_type_opts,
            'audit_statuses': audit_status_opts,
        })
    except Exception as e:
        return Response({'error': 'Failed to load inventory choices', 'details': str(e)}, status=500)

class SoftwareViewSet(viewsets.ModelViewSet):
    queryset = Software.objects.all()
    serializer_class = SoftwareSerializer
    permission_classes = [IsStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'version', 'license_type']
    ordering = ['-created_at']

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    # Allow unauthenticated read access so public pages (e.g., Register) can load department list
    permission_classes = [permissions.AllowAny]
    # Expose only safe methods to keep this endpoint read-only for the public
    http_method_names = ['get', 'head', 'options']

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [RoleBasedPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['department']
    
    def get_queryset(self):
        """Filter locations based on user role and department (aligned roles)."""
        queryset = Location.objects.all()
        user = self.request.user
        
        if not user or not user.is_authenticated:
            return Location.objects.none()
        
        # System admin and IT manager can see all locations
        if getattr(user, 'role', '') in ['system_admin', 'it_manager'] or user.is_staff:
            return queryset
        
        # Technicians (incl. senior technicians) can see their department + IT
        if getattr(user, 'role', '') in ['technician', 'senior_technician']:
            return queryset.filter(
                models.Q(department__name__iexact=getattr(user, 'department', '')) |
                models.Q(department__name__iexact='it')
            )
        
        # End users can only see locations in their department
        if hasattr(user, 'department') and user.department:
            return queryset.filter(department__name__iexact=user.department)
        
        return Location.objects.none()

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [IsAdminOrStaff]

class EquipmentCategoryViewSet(viewsets.ModelViewSet):
    queryset = EquipmentCategory.objects.all()
    serializer_class = EquipmentCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class MaintenanceScheduleViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceSchedule.objects.all()
    serializer_class = MaintenanceScheduleSerializer
    permission_classes = [RoleBasedPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['equipment', 'frequency']
    ordering = ['next_maintenance']
    
    def get_queryset(self):
        """Filter maintenance schedules based on user role and department (aligned roles)."""
        queryset = MaintenanceSchedule.objects.all()
        user = self.request.user
        
        if not user or not user.is_authenticated:
            return MaintenanceSchedule.objects.none()
        
        # System admin and IT manager can see all schedules
        if getattr(user, 'role', '') in ['system_admin', 'it_manager'] or user.is_staff:
            return queryset
        
        # Technicians (incl. senior technicians) can see department + IT
        if getattr(user, 'role', '') in ['technician', 'senior_technician']:
            return queryset.filter(
                models.Q(equipment__location__department__name__iexact=getattr(user, 'department', '')) |
                models.Q(equipment__location__department__name__iexact='it')
            )
        
        # End users can only see schedules in their department
        if hasattr(user, 'department') and user.department:
            return queryset.filter(equipment__location__department__name__iexact=user.department)
        
        return MaintenanceSchedule.objects.none()

class AssetHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AssetHistory.objects.all()
    serializer_class = AssetHistorySerializer
    permission_classes = [RoleBasedPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['equipment', 'action', 'user']
    ordering = ['-timestamp']

class AssetCheckoutViewSet(viewsets.ModelViewSet):
    queryset = AssetCheckout.objects.all()
    serializer_class = AssetCheckoutSerializer
    permission_classes = [RoleBasedPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['equipment', 'checked_out_to', 'is_overdue']
    ordering = ['-checkout_date']

    def get_queryset(self):
        """Support frontend query params like overdue=true by mapping to is_overdue.
        Also optionally respect status=checked_out for compatibility (filters out returned items).
        """
        qs = super().get_queryset()
        params = getattr(self.request, 'query_params', {})
        overdue_param = str(params.get('overdue', '')).lower()
        if overdue_param in ('true', '1', 'yes'):
            qs = qs.filter(is_overdue=True)
        status_param = str(params.get('status', '')).lower()
        if status_param == 'checked_out':
            qs = qs.filter(actual_return_date__isnull=True)
        return qs
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue checkouts"""
        overdue_checkouts = self.get_queryset().filter(
            actual_return_date__isnull=True,
            expected_return_date__lt=timezone.now()
        )
        serializer = self.get_serializer(overdue_checkouts, many=True)
        return Response(serializer.data)

class AssetAuditViewSet(viewsets.ModelViewSet):
    queryset = AssetAudit.objects.all()
    serializer_class = AssetAuditSerializer
    permission_classes = [RoleBasedPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['audit_type', 'status', 'auditor']
    ordering = ['-scheduled_date']

class AssetAuditItemViewSet(viewsets.ModelViewSet):
    queryset = AssetAuditItem.objects.all()
    serializer_class = AssetAuditItemSerializer
    permission_classes = [RoleBasedPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['audit', 'equipment', 'result']

class AssetAlertViewSet(viewsets.ModelViewSet):
    queryset = AssetAlert.objects.all()
    serializer_class = AssetAlertSerializer
    permission_classes = [RoleBasedPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['equipment', 'alert_type', 'severity', 'is_active']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Acknowledge an alert"""
        alert = self.get_object()
        alert.acknowledge(request.user)
        return Response({'message': 'Alert acknowledged'})
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve an alert"""
        alert = self.get_object()
        alert.resolve(request.user)
        return Response({'message': 'Alert resolved'})

class AssetTagViewSet(viewsets.ModelViewSet):
    queryset = AssetTag.objects.all()
    serializer_class = AssetTagSerializer
    permission_classes = [RoleBasedPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['equipment', 'tag_type', 'is_active']
