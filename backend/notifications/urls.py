from django.urls import path
from . import views

urlpatterns = [
    # Notification endpoints
    path('', views.get_notifications, name='get_notifications'),
    path('stats/', views.get_notification_stats, name='notification_stats'),
    path('create/', views.create_notification, name='create_notification'),
    path('mark-all-read/', views.mark_all_read, name='mark_all_read'),
    path('<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('<int:notification_id>/dismiss/', views.dismiss_notification, name='dismiss_notification'),
    
    # Preferences
    path('preferences/', views.notification_preferences, name='notification_preferences'),
]
