from django.core.management.base import BaseCommand
from django.conf import settings
import os


class Command(BaseCommand):
    help = 'Setup logging directories and files'

    def handle(self, *args, **options):
        # Create logs directory if it doesn't exist
        logs_dir = settings.BASE_DIR / 'logs'
        logs_dir.mkdir(exist_ok=True)
        
        # Create log file if it doesn't exist
        log_file = logs_dir / 'hospital_it.log'
        if not log_file.exists():
            log_file.touch()
            
        self.stdout.write(
            self.style.SUCCESS(f'Successfully setup logging directory: {logs_dir}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Log file ready: {log_file}')
        )
