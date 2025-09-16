from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Equipment, Software, Department, Location, Vendor, EquipmentCategory, MaintenanceSchedule
from .serializers import (
    EquipmentSerializer, SoftwareSerializer, DepartmentSerializer,
    LocationSerializer, VendorSerializer, EquipmentCategorySerializer,
    MaintenanceScheduleSerializer
)

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'location', 'priority']
    search_fields = ['name', 'asset_tag', 'serial_number', 'model', 'manufacturer']
    ordering_fields = ['name', 'created_at', 'warranty_expiry']
    ordering = ['-created_at']

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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'version', 'license_type']
    ordering = ['-created_at']

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['department']

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

class EquipmentCategoryViewSet(viewsets.ModelViewSet):
    queryset = EquipmentCategory.objects.all()
    serializer_class = EquipmentCategorySerializer

class MaintenanceScheduleViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceSchedule.objects.all()
    serializer_class = MaintenanceScheduleSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['equipment', 'frequency']
    ordering = ['next_maintenance']
