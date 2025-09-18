from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from notifications.models import Notification
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample notifications for testing'

    def handle(self, *args, **options):
        # Get or create test user
        try:
            user = User.objects.get(email='test@example.com')
        except User.DoesNotExist:
            user = User.objects.get(email='admin@hospital-it.com')
        
        # Sample notifications
        notifications_data = [
            {
                'title': 'Welcome to Hospital IT System',
                'message': 'Your account has been successfully created. Please complete your profile setup.',
                'type': 'info',
                'priority': 'medium',
            },
            {
                'title': 'System Maintenance Scheduled',
                'message': 'The system will undergo maintenance on Sunday from 2:00 AM to 4:00 AM.',
                'type': 'warning',
                'priority': 'high',
            },
            {
                'title': 'New Equipment Request',
                'message': 'A new equipment request has been submitted and requires your attention.',
                'type': 'request',
                'priority': 'medium',
                'action_url': '/app/requests',
            },
            {
                'title': 'Task Assignment',
                'message': 'You have been assigned a new task: "Update server configurations".',
                'type': 'task',
                'priority': 'high',
                'action_url': '/app/tasks',
            },
            {
                'title': 'Critical System Alert',
                'message': 'Server CPU usage has exceeded 90%. Immediate attention required.',
                'type': 'error',
                'priority': 'critical',
            },
            {
                'title': 'Backup Completed Successfully',
                'message': 'Daily system backup has been completed without errors.',
                'type': 'success',
                'priority': 'low',
            },
        ]
        
        created_count = 0
        for notif_data in notifications_data:
            # Check if notification already exists
            if not Notification.objects.filter(
                recipient=user,
                title=notif_data['title']
            ).exists():
                Notification.objects.create(
                    recipient=user,
                    **notif_data
                )
                created_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} sample notifications')
        )
