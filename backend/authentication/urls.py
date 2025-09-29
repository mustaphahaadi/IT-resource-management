from django.urls import path
from . import views, admin_views

urlpatterns = [
    # Authentication endpoints
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    
    # Profile management
    path('profile/', views.get_user_profile, name='profile'),
    path('profile/update/', views.update_user_profile, name='update_profile'),
    path('user/stats/', views.user_stats, name='user_stats'),
    path('user/activity/', views.user_activity, name='user_activity'),
    path('user/preferences/', views.user_preferences, name='user_preferences'),
    
    # Password management
    path('change-password/', views.change_password, name='change_password'),
    path('request-password-reset/', views.request_password_reset, name='request_password_reset'),
    path('reset-password/', views.reset_password, name='reset_password'),
    
    # Email verification
    path('verify-email/', views.verify_email, name='verify_email'),
    path('resend-verification/', views.resend_verification_email, name='resend_verification'),
    
    # User approval endpoints
    path('users/pending-approval/', views.pending_approval_users, name='pending_approval_users'),
    path('users/<int:user_id>/approve/', views.approve_user, name='approve_user'),
    path('users/<int:user_id>/reject/', views.reject_user, name='reject_user'),
    
    # Admin endpoints
    path('admin/users/', admin_views.get_users, name='admin_get_users'),
    path('admin/users/<int:user_id>/', admin_views.get_user_details, name='admin_get_user_details'),
    path('admin/users/<int:user_id>/update/', admin_views.update_user, name='admin_update_user'),
    path('admin/users/<int:user_id>/approve/', admin_views.approve_user, name='admin_approve_user'),
    path('admin/users/<int:user_id>/disapprove/', admin_views.disapprove_user, name='admin_disapprove_user'),
    path('admin/users/<int:user_id>/activate/', admin_views.activate_user, name='admin_activate_user'),
    path('admin/users/<int:user_id>/deactivate/', admin_views.deactivate_user, name='admin_deactivate_user'),
    path('admin/users/<int:user_id>/unlock/', admin_views.unlock_user_account, name='admin_unlock_user'),
    path('admin/users/<int:user_id>/delete/', admin_views.delete_user, name='admin_delete_user'),
    path('admin/statistics/', admin_views.get_admin_statistics, name='admin_statistics'),
    path('admin/login-attempts/', admin_views.get_recent_login_attempts, name='admin_login_attempts'),
    path('roles/', admin_views.get_roles, name='roles'),
]
