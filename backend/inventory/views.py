from rest_framework import viewsets, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from .models import Equipment, Software, Department, Location, Vendor, EquipmentCategory, MaintenanceSchedule
from .serializers import (
    EquipmentSerializer, SoftwareSerializer, DepartmentSerializer,
    LocationSerializer, VendorSerializer, EquipmentCategorySerializer,
    MaintenanceScheduleSerializer
)
from authentication.permissions import IsStaffOrReadOnly, IsAdminOrStaff, DepartmentBasedPermission, RoleBasedPermission

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
        """Filter equipment based on user role and department."""
        queryset = Equipment.objects.all()
        user = self.request.user
        
        if not user or not user.is_authenticated:
            return Equipment.objects.none()
        
        # Admin and staff can see all equipment
        if user.role in ['admin', 'staff'] or user.is_staff:
            return queryset
        
        # Technicians can see equipment in their department and IT department
        if user.role == 'technician':
            return queryset.filter(
                models.Q(location__department__name__iexact=user.department) |
                models.Q(location__department__name__iexact='it')
            )
        
        # Regular users can only see equipment in their department
        if hasattr(user, 'department') and user.department:
            return queryset.filter(location__department__name__iexact=user.department)
        
        return Equipment.objects.none()

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        total_equipment = Equipment.objects.count()
        active_equipment = Equipment.objects.filter(status='active').count()
        maintenance_equipment = Equipment.objects.filter(status='maintenance').count()
        critical_equipment = Equipment.objects.filter(priority='critical').count()
        
        return Response({
            'total_equipment': total_equipment,
            'active_equipment': active_equipment,
            'maintenance_equipment': maintenance_equipment,
            'critical_equipment': critical_equipment,
        })

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
    permission_classes = [permissions.IsAuthenticated]

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [RoleBasedPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['department']
    
    def get_queryset(self):
        """Filter locations based on user role and department."""
        queryset = Location.objects.all()
        user = self.request.user
        
        if not user or not user.is_authenticated:
            return Location.objects.none()
        
        # Admin and staff can see all locations
        if user.role in ['admin', 'staff'] or user.is_staff:
            return queryset
        
        # Technicians can see locations in their department and IT
        if user.role == 'technician':
            return queryset.filter(
                models.Q(department__name__iexact=user.department) |
                models.Q(department__name__iexact='it')
            )
        
        # Regular users can only see locations in their department
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
        """Filter maintenance schedules based on user role and department."""
        queryset = MaintenanceSchedule.objects.all()
        user = self.request.user
        
        if not user or not user.is_authenticated:
            return MaintenanceSchedule.objects.none()
        
        # Admin and staff can see all schedules
        if user.role in ['admin', 'staff'] or user.is_staff:
            return queryset
        
        # Technicians can see schedules for equipment in their department and IT
        if user.role == 'technician':
            return queryset.filter(
                models.Q(equipment__location__department__name__iexact=user.department) |
                models.Q(equipment__location__department__name__iexact='it')
            )
        
        # Regular users can only see schedules for equipment in their department
        if hasattr(user, 'department') and user.department:
            return queryset.filter(equipment__location__department__name__iexact=user.department)
        
        return MaintenanceSchedule.objects.none()
