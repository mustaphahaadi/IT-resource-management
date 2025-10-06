from rest_framework import serializers
from .activity_logger import ActivityLog
from django.contrib.auth import get_user_model

User = get_user_model()

class UserNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

class GenericRelatedField(serializers.Field):
    """
    A custom field to use for the `content_object` generic relationship.
    """
    def to_representation(self, value):
        if value:
            return {
                "id": value.pk,
                "type": value.__class__.__name__,
                "display": str(value)
            }
        return None

class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserNestedSerializer(read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    content_object_display = GenericRelatedField(source='content_object', read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'action_type', 'action_type_display', 'severity', 
            'severity_display', 'timestamp', 'description', 'content_object_display',
            'old_values', 'new_values', 'metadata', 'ip_address'
        ]
        read_only_fields = fields
