from rest_framework import serializers
from .models import Notification, NotificationPreference

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'type', 'priority',
            'is_read', 'is_dismissed', 'action_url',
            'created_at', 'read_at', 'sender_name', 'time_ago',
            'related_object_type', 'related_object_id'
        ]
        read_only_fields = ['id', 'created_at', 'read_at', 'sender_name', 'time_ago']
    
    def get_sender_name(self, obj):
        if obj.sender:
            return obj.sender.get_full_name() or obj.sender.username
        return "System"
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        from django.utils.timesince import timesince
        
        now = timezone.now()
        time_diff = now - obj.created_at
        
        if time_diff.days > 0:
            return f"{time_diff.days} day{'s' if time_diff.days > 1 else ''} ago"
        elif time_diff.seconds > 3600:
            hours = time_diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif time_diff.seconds > 60:
            minutes = time_diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'system_notifications', 'request_notifications',
            'task_notifications', 'maintenance_notifications',
            'quiet_hours_start', 'quiet_hours_end',
            'email_digest_frequency'
        ]

class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'title', 'message', 'type', 'priority',
            'recipient', 'action_url', 'expires_at',
            'related_object_type', 'related_object_id'
        ]
    
    def create(self, validated_data):
        # Set sender from request context
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['sender'] = request.user
        
        return super().create(validated_data)
