import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_it.settings')

# Import Django and initialize
import django
from django.core.wsgi import get_wsgi_application

# Initialize Django
django.setup()

# Create WSGI application
application = get_wsgi_application()