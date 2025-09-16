from rest_framework import serializers
from .models import SupportRequest, RequestCategory, RequestComment, RequestAttachment, Alert

class RequestCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestCategory
        fields = '__all__'

class RequestCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = RequestComment
        fields = '__all__'

class RequestAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = RequestAttachment
        fields = '__all__'

class SupportRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    equipment_name = serializers.CharField(source='related_equipment.name', read_only=True)
    comments = RequestCommentSerializer(many=True, read_only=True)
    attachments = RequestAttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = SupportRequest
        fields = '__all__'

class AlertSerializer(serializers.ModelSerializer):
    acknowledged_by_name = serializers.CharField(source='acknowledged_by.get_full_name', read_only=True)
    request_ticket = serializers.CharField(source='related_request.ticket_number', read_only=True)
    equipment_name = serializers.CharField(source='related_equipment.name', read_only=True)
    
    class Meta:
        model = Alert
        fields = '__all__'
