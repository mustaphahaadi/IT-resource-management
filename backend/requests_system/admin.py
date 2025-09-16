from django.contrib import admin
from .models import SupportRequest, RequestCategory, RequestComment, RequestAttachment, Alert

@admin.register(SupportRequest)
class SupportRequestAdmin(admin.ModelAdmin):
    list_display = ['ticket_number', 'title', 'priority', 'status', 'requester', 'assigned_to', 'created_at']
    list_filter = ['status', 'priority', 'category', 'channel', 'created_at']
    search_fields = ['ticket_number', 'title', 'description', 'requester__username']
    date_hierarchy = 'created_at'
    readonly_fields = ['ticket_number', 'created_at', 'updated_at']

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ['title', 'alert_type', 'is_acknowledged', 'created_at']
    list_filter = ['alert_type', 'is_acknowledged', 'created_at']
    search_fields = ['title', 'message']

admin.site.register(RequestCategory)
admin.site.register(RequestComment)
admin.site.register(RequestAttachment)
