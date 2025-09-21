from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_analytics, name='dashboard_analytics'),
    path('recent-activity/', views.recent_activity, name='recent_activity'),
    path('requests/', views.request_analytics, name='request_analytics'),
    path('system-health/', views.system_health, name='system_health'),
]
