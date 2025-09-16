from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupportRequestViewSet, RequestCategoryViewSet, AlertViewSet

router = DefaultRouter()
router.register(r'support-requests', SupportRequestViewSet)
router.register(r'categories', RequestCategoryViewSet)
router.register(r'alerts', AlertViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
