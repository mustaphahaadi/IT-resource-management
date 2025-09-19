from django.core.management.base import BaseCommand
import subprocess
import os

class Command(BaseCommand):
    help = 'Populate the database with sample data for testing and development'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting sample data population...'))
        
        # Get the path to the create_sample_data.py script
        script_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'create_sample_data.py')
        
        try:
            # Run the sample data script
            result = subprocess.run(['python', script_path], 
                                  capture_output=True, 
                                  text=True, 
                                  cwd=os.path.dirname(script_path))
            
            if result.returncode == 0:
                self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
                self.stdout.write(result.stdout)
            else:
                self.stdout.write(self.style.ERROR('Error creating sample data:'))
                self.stdout.write(result.stderr)
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to run sample data script: {e}'))
