#!/usr/bin/env python
"""
Django development server startup script for Hospital IT System
"""
import os
import sys
import subprocess

def main():
    """Run the Django development server with proper setup"""
    
    # Set the Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_it.settings')
    
    print("🏥 Hospital IT System - Starting Django Server")
    print("=" * 50)
    
    try:
        # Check if migrations need to be run
        print("📋 Checking database migrations...")
        result = subprocess.run([sys.executable, 'manage.py', 'showmigrations', '--plan'], 
                              capture_output=True, text=True)
        
        if '[ ]' in result.stdout:
            print("🔄 Running database migrations...")
            subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
            print("✅ Migrations completed successfully!")
        else:
            print("✅ Database is up to date!")
        
        # Create superuser if it doesn't exist
        print("\n👤 Checking for superuser...")
        try:
            from django.contrib.auth import get_user_model
            import django
            django.setup()
            
            User = get_user_model()
            if not User.objects.filter(is_superuser=True).exists():
                print("🔐 Creating default superuser...")
                print("   Username: admin")
                print("   Email: admin@hospital-it.com")
                print("   Password: admin123")
                
                User.objects.create_superuser(
                    username='admin',
                    email='admin@hospital-it.com',
                    password='admin123'
                )
                print("✅ Superuser created successfully!")
            else:
                print("✅ Superuser already exists!")
                
        except Exception as e:
            print(f"⚠️  Could not create superuser: {e}")
        
        print("\n🚀 Starting development server...")
        print("📍 Server will be available at: http://localhost:8000")
        print("📍 Admin panel: http://localhost:8000/admin")
        print("📍 API endpoints: http://localhost:8000/api/")
        print("\n⏹️  Press Ctrl+C to stop the server")
        print("=" * 50)
        
        # Start the development server
        subprocess.run([sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000'], check=True)
        
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error running command: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
