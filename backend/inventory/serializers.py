from rest_framework import serializers
from .models import (
    Equipment, Software, Department, Location, Vendor, EquipmentCategory, 
    MaintenanceSchedule, AssetHistory, AssetCheckout, AssetAudit, 
    AssetAuditItem, AssetAlert, AssetTag
)

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
    checked_out_to_name = serializers.CharField(source='checked_out_to.get_full_name', read_only=True)
    
    # Computed fields
    is_overdue_maintenance = serializers.SerializerMethodField()
    is_warranty_expired = serializers.SerializerMethodField()
    is_warranty_expiring_soon = serializers.SerializerMethodField()
    days_until_warranty_expiry = serializers.SerializerMethodField()
    age_in_years = serializers.SerializerMethodField()
    
    class Meta:
        model = Equipment
        fields = '__all__'
        read_only_fields = ('id',)
    
    def get_is_overdue_maintenance(self, obj):
        return obj.is_overdue_maintenance()
    
    def get_is_warranty_expired(self, obj):
        return obj.is_warranty_expired()
    
    def get_is_warranty_expiring_soon(self, obj):
        return obj.is_warranty_expiring_soon()
    
    def get_days_until_warranty_expiry(self, obj):
        if obj.warranty_expiry:
            from django.utils import timezone
            return (obj.warranty_expiry - timezone.now().date()).days
        return None
    
    def get_age_in_years(self, obj):
        if obj.purchase_date:
            from django.utils import timezone
            return round((timezone.now().date() - obj.purchase_date).days / 365.25, 1)
        return None

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

class AssetHistorySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    equipment_asset_tag = serializers.CharField(source='equipment.asset_tag', read_only=True)
    
    class Meta:
        model = AssetHistory
        fields = '__all__'

class AssetCheckoutSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    equipment_asset_tag = serializers.CharField(source='equipment.asset_tag', read_only=True)
    checked_out_to_name = serializers.CharField(source='checked_out_to.get_full_name', read_only=True)
    checked_out_by_name = serializers.CharField(source='checked_out_by.get_full_name', read_only=True)
    checked_in_by_name = serializers.CharField(source='checked_in_by.get_full_name', read_only=True)
    
    class Meta:
        model = AssetCheckout
        fields = '__all__'

class AssetAuditSerializer(serializers.ModelSerializer):
    auditor_name = serializers.CharField(source='auditor.get_full_name', read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AssetAudit
        fields = '__all__'
    
    def get_items_count(self, obj):
        return obj.items.count()

class AssetAuditItemSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    equipment_asset_tag = serializers.CharField(source='equipment.asset_tag', read_only=True)
    expected_location_name = serializers.CharField(source='expected_location.__str__', read_only=True)
    actual_location_name = serializers.CharField(source='actual_location.__str__', read_only=True)
    audited_by_name = serializers.CharField(source='audited_by.get_full_name', read_only=True)
    
    class Meta:
        model = AssetAuditItem
        fields = '__all__'

class AssetAlertSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    equipment_asset_tag = serializers.CharField(source='equipment.asset_tag', read_only=True)
    acknowledged_by_name = serializers.CharField(source='acknowledged_by.get_full_name', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True)
    
    class Meta:
        model = AssetAlert
        fields = '__all__'

class AssetTagSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    equipment_asset_tag = serializers.CharField(source='equipment.asset_tag', read_only=True)
    
    class Meta:
        model = AssetTag
        fields = '__all__'
