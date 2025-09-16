from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, ITPersonnelViewSet, WorkflowTemplateViewSet, TaskAssignmentRuleViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'personnel', ITPersonnelViewSet)
router.register(r'workflows', WorkflowTemplateViewSet)
router.register(r'assignment-rules', TaskAssignmentRuleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
