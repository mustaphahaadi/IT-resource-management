from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EquipmentViewSet, SoftwareViewSet, DepartmentViewSet,
    LocationViewSet, VendorViewSet, EquipmentCategoryViewSet,
    MaintenanceScheduleViewSet, AssetHistoryViewSet, AssetCheckoutViewSet,
    AssetAuditViewSet, AssetAuditItemViewSet, AssetAlertViewSet, AssetTagViewSet
)

router = DefaultRouter()
router.register(r'equipment', EquipmentViewSet)
router.register(r'software', SoftwareViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'vendors', VendorViewSet)
router.register(r'categories', EquipmentCategoryViewSet)
router.register(r'maintenance', MaintenanceScheduleViewSet)
router.register(r'asset-history', AssetHistoryViewSet)
router.register(r'asset-checkouts', AssetCheckoutViewSet)
router.register(r'asset-audits', AssetAuditViewSet)
router.register(r'asset-audit-items', AssetAuditItemViewSet)
router.register(r'asset-alerts', AssetAlertViewSet)
router.register(r'asset-tags', AssetTagViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
