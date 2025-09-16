from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EquipmentViewSet, SoftwareViewSet, DepartmentViewSet,
    LocationViewSet, VendorViewSet, EquipmentCategoryViewSet,
    MaintenanceScheduleViewSet
)

router = DefaultRouter()
router.register(r'equipment', EquipmentViewSet)
router.register(r'software', SoftwareViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'vendors', VendorViewSet)
router.register(r'categories', EquipmentCategoryViewSet)
router.register(r'maintenance', MaintenanceScheduleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
