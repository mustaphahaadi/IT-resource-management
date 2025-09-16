from django.contrib import admin
from .models import Equipment, Software, Department, Location, Vendor, EquipmentCategory, MaintenanceSchedule, SoftwareInstallation

@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'asset_tag', 'category', 'status', 'location', 'warranty_expiry']
    list_filter = ['status', 'category', 'priority', 'location__department']
    search_fields = ['name', 'asset_tag', 'serial_number', 'model']
    date_hierarchy = 'created_at'

@admin.register(Software)
class SoftwareAdmin(admin.ModelAdmin):
    list_display = ['name', 'version', 'license_type', 'current_installations', 'max_installations', 'expiry_date']
    list_filter = ['license_type', 'vendor']
    search_fields = ['name', 'version']

admin.site.register(Department)
admin.site.register(Location)
admin.site.register(Vendor)
admin.site.register(EquipmentCategory)
admin.site.register(MaintenanceSchedule)
admin.site.register(SoftwareInstallation)
