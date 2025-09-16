from rest_framework import serializers
from .models import Equipment, Software, Department, Location, Vendor, EquipmentCategory, MaintenanceSchedule

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class LocationSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Location
        fields = '__all__'

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = '__all__'

class EquipmentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentCategory
        fields = '__all__'

class EquipmentSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    location_name = serializers.CharField(source='location.__str__', read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = Equipment
        fields = '__all__'

class SoftwareSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    
    class Meta:
        model = Software
        fields = '__all__'

class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    technician_name = serializers.CharField(source='assigned_technician.get_full_name', read_only=True)
    
    class Meta:
        model = MaintenanceSchedule
        fields = '__all__'
