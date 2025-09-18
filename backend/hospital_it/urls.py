from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from django.contrib.auth.views import LogoutView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'permissions', 'role']
    
    def get_permissions(self, obj):
        return list(obj.user_permissions.values_list('codename', flat=True))
    
    def get_role(self, obj):
        if hasattr(obj, 'role') and obj.role:
            return obj.role
        elif obj.is_superuser:
            return 'admin'
        elif obj.groups.filter(name='IT Staff').exists():
            return 'staff'
        else:
            return 'user'

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    request.user.auth_token.delete()
    return Response({'message': 'Logged out successfully'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/inventory/', include('inventory.urls')),
    path('api/requests/', include('requests_system.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/auth/', include('authentication.urls')),
    path('api/auth/', include('rest_framework.urls')),
    path('api/auth/user/', user_profile, name='api_user_profile'),
    path('api/notifications/', include('notifications.urls')),
]
