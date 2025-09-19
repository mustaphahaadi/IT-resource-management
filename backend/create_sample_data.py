#!/usr/bin/env python
"""
Script to create sample data for the Hospital IT Resource Management System
Run this script to populate the database with realistic test data
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone
import random

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_it.settings')
django.setup()

from django.contrib.auth import get_user_model
from inventory.models import Equipment, Department, Location, Vendor, EquipmentCategory
from requests_system.models import SupportRequest, RequestCategory
from tasks.models import Task
from rest_framework.authtoken.models import Token

User = get_user_model()

def create_users():
    """Create sample users"""
    print("Creating sample users...")
    
    # Create admin user
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@hospital.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        Token.objects.get_or_create(user=admin_user)
        print(f"Created admin user: {admin_user.username}")
    
    # Create IT staff users
    it_staff = [
        ('john_doe', 'John', 'Doe', 'john.doe@hospital.com'),
        ('jane_smith', 'Jane', 'Smith', 'jane.smith@hospital.com'),
        ('mike_wilson', 'Mike', 'Wilson', 'mike.wilson@hospital.com'),
    ]
    
    for username, first_name, last_name, email in it_staff:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'is_staff': True
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            Token.objects.get_or_create(user=user)
            print(f"Created IT staff user: {user.username}")
    
    # Create regular users
    regular_users = [
        ('nurse_alice', 'Alice', 'Johnson', 'alice.johnson@hospital.com'),
        ('doctor_bob', 'Bob', 'Brown', 'bob.brown@hospital.com'),
        ('admin_carol', 'Carol', 'Davis', 'carol.davis@hospital.com'),
        ('tech_david', 'David', 'Miller', 'david.miller@hospital.com'),
    ]
    
    for username, first_name, last_name, email in regular_users:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            Token.objects.get_or_create(user=user)
            print(f"Created regular user: {user.username}")

def create_departments_and_locations():
    """Create departments and locations"""
    print("Creating departments and locations...")
    
    dept_data = [
        ('IT', 'Information Technology Department'),
        ('Medical', 'Medical Department'),
        ('Laboratory', 'Laboratory Department'),
        ('Administration', 'Administration Department'),
        ('Nursing', 'Nursing Department'),
        ('Pharmacy', 'Pharmacy Department'),
    ]
    
    departments = {}
    for name, description in dept_data:
        dept, created = Department.objects.get_or_create(
            name=name,
            defaults={'description': description}
        )
        departments[name] = dept
        if created:
            print(f"Created department: {dept.name}")
    
    # Create locations for each department
    locations = {}
    for dept_name, dept in departments.items():
        location, created = Location.objects.get_or_create(
            building='Main Hospital',
            floor='1st Floor' if dept_name in ['IT', 'Administration'] else '2nd Floor',
            room=f'{dept_name} Room 101',
            department=dept
        )
        locations[dept_name] = location
        if created:
            print(f"Created location: {location}")
    
    return departments, locations

def create_vendors_and_categories():
    """Create vendors and equipment categories"""
    print("Creating vendors and categories...")
    
    vendor_data = [
        ('Dell Technologies', 'sales@dell.com', '+1-800-DELL', 'Round Rock, TX'),
        ('HP Inc.', 'sales@hp.com', '+1-800-HP-HELP', 'Palo Alto, CA'),
        ('Cisco Systems', 'sales@cisco.com', '+1-800-CISCO', 'San Jose, CA'),
        ('GE Healthcare', 'sales@gehealthcare.com', '+1-800-GE-CARE', 'Chicago, IL'),
        ('Philips Healthcare', 'sales@philips.com', '+1-800-PHILIPS', 'Amsterdam, Netherlands'),
    ]
    
    vendors = {}
    for name, email, phone, address in vendor_data:
        vendor, created = Vendor.objects.get_or_create(
            name=name,
            defaults={
                'contact_email': email,
                'contact_phone': phone,
                'address': address
            }
        )
        vendors[name] = vendor
        if created:
            print(f"Created vendor: {vendor.name}")
    
    category_data = [
        ('Computer', 'Desktop and laptop computers'),
        ('Network Equipment', 'Switches, routers, and network devices'),
        ('Medical Device', 'Medical equipment and devices'),
        ('Printer', 'Printers and multifunction devices'),
        ('Server', 'Server hardware'),
        ('Phone System', 'IP phones and communication devices'),
    ]
    
    categories = {}
    for name, description in category_data:
        category, created = EquipmentCategory.objects.get_or_create(
            name=name,
            defaults={'description': description}
        )
        categories[name] = category
        if created:
            print(f"Created category: {category.name}")
    
    return vendors, categories

def create_equipment():
    """Create sample equipment"""
    print("Creating sample equipment...")
    
    departments, locations = create_departments_and_locations()
    vendors, categories = create_vendors_and_categories()
    
    equipment_data = [
        # IT Equipment
        ('Dell OptiPlex 7090', 'DL-001', 'OptiPlex 7090', 'Dell', 'Computer', 'IT', 'active', 'Dell Technologies'),
        ('HP EliteBook 840', 'HP-001', 'EliteBook 840', 'HP', 'Computer', 'IT', 'active', 'HP Inc.'),
        ('Cisco Catalyst 2960', 'CS-001', 'Catalyst 2960', 'Cisco', 'Network Equipment', 'IT', 'active', 'Cisco Systems'),
        ('Dell PowerEdge R740', 'DL-002', 'PowerEdge R740', 'Dell', 'Server', 'IT', 'maintenance', 'Dell Technologies'),
        ('HP LaserJet Pro 400', 'HP-002', 'LaserJet Pro 400', 'HP', 'Printer', 'IT', 'active', 'HP Inc.'),
        
        # Medical Equipment
        ('GE Vivid E95', 'GE-001', 'Vivid E95', 'GE', 'Medical Device', 'Medical', 'active', 'GE Healthcare'),
        ('Philips MX800', 'PH-001', 'MX800', 'Philips', 'Medical Device', 'Medical', 'active', 'Philips Healthcare'),
        ('Siemens ACUSON', 'SM-001', 'ACUSON', 'Siemens', 'Medical Device', 'Medical', 'broken', 'GE Healthcare'),
        ('Medtronic Ventilator', 'MD-001', 'Ventilator Pro', 'Medtronic', 'Medical Device', 'Medical', 'active', 'GE Healthcare'),
        ('Defibrillator AED', 'DF-001', 'AED Plus', 'Zoll', 'Medical Device', 'Medical', 'active', 'GE Healthcare'),
        
        # Laboratory Equipment
        ('Beckman Coulter Analyzer', 'BC-001', 'DxH 900', 'Beckman Coulter', 'Medical Device', 'Laboratory', 'active', 'GE Healthcare'),
        ('Thermo Fisher Centrifuge', 'TF-001', 'Sorvall ST 8R', 'Thermo Fisher', 'Medical Device', 'Laboratory', 'maintenance', 'GE Healthcare'),
        ('Abbott ARCHITECT', 'AB-001', 'ARCHITECT c4000', 'Abbott', 'Medical Device', 'Laboratory', 'active', 'GE Healthcare'),
        
        # Administration Equipment
        ('Canon ImageRunner', 'CN-001', 'imageRUNNER ADVANCE', 'Canon', 'Printer', 'Administration', 'active', 'HP Inc.'),
        ('Polycom VVX 411', 'PC-001', 'VVX 411', 'Polycom', 'Phone System', 'Administration', 'active', 'Cisco Systems'),
    ]
    
    for name, asset_tag, model, manufacturer, category_name, dept_name, status, vendor_name in equipment_data:
        equipment, created = Equipment.objects.get_or_create(
            asset_tag=asset_tag,
            defaults={
                'name': name,
                'model': model,
                'manufacturer': manufacturer,
                'category': categories[category_name],
                'location': locations[dept_name],
                'vendor': vendors[vendor_name],
                'status': status,
                'purchase_date': timezone.now().date() - timedelta(days=random.randint(30, 365)),
                'warranty_expiry': timezone.now().date() + timedelta(days=random.randint(30, 730)),
                'purchase_cost': random.randint(500, 50000),
            }
        )
        if created:
            print(f"Created equipment: {equipment.name}")

def create_support_requests():
    """Create sample support requests"""
    print("Creating sample support requests...")
    
    users = list(User.objects.all())
    if not users:
        print("No users found. Creating users first...")
        create_users()
        users = list(User.objects.all())
    
    # Create request categories first
    categories = {}
    category_data = [
        ('Hardware', 'Hardware related issues'),
        ('Software', 'Software related issues'),
        ('Network', 'Network connectivity issues'),
        ('Access', 'Access and permissions'),
        ('General', 'General IT support'),
    ]
    
    for name, description in category_data:
        category, created = RequestCategory.objects.get_or_create(
            name=name,
            defaults={'description': description}
        )
        categories[name] = category
        if created:
            print(f"Created request category: {category.name}")
    
    request_data = [
        ('Computer won\'t start', 'The computer in room 205 won\'t turn on. Checked power cable.', 'high', 'IT', 'Hardware'),
        ('Printer paper jam', 'Printer on 3rd floor keeps jamming. Need urgent fix.', 'medium', 'IT', 'Hardware'),
        ('Network connectivity issues', 'Unable to access hospital network from nursing station.', 'critical', 'Nursing', 'Network'),
        ('Software installation request', 'Need new medical software installed on workstation.', 'low', 'Medical', 'Software'),
        ('Email not working', 'Cannot send or receive emails since this morning.', 'medium', 'Administration', 'Software'),
        ('Monitor flickering', 'Monitor in doctor\'s office keeps flickering and going black.', 'medium', 'Medical', 'Hardware'),
        ('Backup system failure', 'Daily backup system showing error messages.', 'critical', 'IT', 'Software'),
        ('Phone system down', 'IP phones not working in administration wing.', 'high', 'Administration', 'Hardware'),
        ('Database access slow', 'Patient database very slow to load records.', 'high', 'Medical', 'Software'),
        ('Scanner not working', 'Document scanner in records department not functioning.', 'medium', 'Administration', 'Hardware'),
    ]
    
    statuses = ['open', 'assigned', 'in_progress', 'resolved', 'closed']
    
    for i, (title, description, priority, department, category_name) in enumerate(request_data):
        # Create requests over the past 30 days
        created_date = timezone.now() - timedelta(days=random.randint(0, 30))
        
        # Assign random status, but make some resolved for metrics
        if i < 6:  # First 6 requests have varied statuses
            status = random.choice(statuses)
        else:  # Last 4 are resolved for better metrics
            status = 'resolved'
        
        # If resolved, set updated_at to simulate resolution time
        updated_date = created_date
        resolved_date = None
        if status in ['resolved', 'closed']:
            resolved_date = created_date + timedelta(hours=random.randint(1, 72))
            updated_date = resolved_date
        
        # Generate a unique title for get_or_create
        unique_title = f"{title} - {i+1}"
        
        request, created = SupportRequest.objects.get_or_create(
            title=unique_title,
            defaults={
                'description': description,
                'priority': priority,
                'status': status,
                'category': categories[category_name],
                'requester_department': department,
                'requester_location': f'{department} Department, Room {100 + i}',
                'requester': random.choice(users),
                'created_at': created_date,
                'updated_at': updated_date,
                'resolved_at': resolved_date,
            }
        )
        if created:
            print(f"Created support request: {request.title}")

def create_tasks():
    """Create sample tasks"""
    print("Creating sample tasks...")
    
    # Get some support requests to link tasks to
    support_requests = list(SupportRequest.objects.all())
    if not support_requests:
        print("No support requests found. Tasks need to be linked to requests.")
        return
    
    task_data = [
        ('Update antivirus software', 'Update antivirus on all workstations', 'medium'),
        ('Backup server maintenance', 'Perform monthly maintenance on backup servers', 'high'),
        ('Network security audit', 'Conduct quarterly network security audit', 'high'),
        ('Replace UPS batteries', 'Replace batteries in UPS units in server room', 'medium'),
        ('Software license renewal', 'Renew Microsoft Office licenses for all departments', 'low'),
        ('Equipment inventory check', 'Quarterly inventory check of all IT equipment', 'medium'),
        ('User training session', 'Conduct training session for new EMR system', 'medium'),
        ('Firewall configuration', 'Update firewall rules for new medical devices', 'high'),
        ('Database optimization', 'Optimize patient database for better performance', 'medium'),
        ('Disaster recovery test', 'Test disaster recovery procedures', 'critical'),
    ]
    
    statuses = ['pending', 'assigned', 'in_progress', 'completed']
    
    for i, (title, description, priority) in enumerate(task_data):
        # Create tasks over the past 30 days
        created_date = timezone.now() - timedelta(days=random.randint(0, 30))
        
        # Set due dates
        due_date = created_date + timedelta(days=random.randint(1, 14))
        
        # Assign status
        if i < 4:  # First 4 tasks have varied statuses
            status = random.choice(statuses)
        else:  # Rest are completed for better metrics
            status = 'completed'
        
        # If completed, set completion date
        completed_date = None
        if status == 'completed':
            completed_date = min(due_date, created_date + timedelta(days=random.randint(1, 10)))
        
        # Generate unique title
        unique_title = f"{title} - {i+1}"
        
        task, created = Task.objects.get_or_create(
            title=unique_title,
            defaults={
                'description': description,
                'priority': priority,
                'status': status,
                'related_request': random.choice(support_requests),
                'due_date': due_date,
                'created_at': created_date,
                'completed_at': completed_date,
                'estimated_hours': random.randint(1, 8),
            }
        )
        if created:
            print(f"Created task: {task.title}")

def main():
    """Main function to create all sample data"""
    print("Creating sample data for Hospital IT Resource Management System...")
    print("=" * 60)
    
    try:
        create_users()
        print()
        create_equipment()
        print()
        create_support_requests()
        print()
        create_tasks()
        print()
        print("=" * 60)
        print("Sample data creation completed successfully!")
        print()
        print("You can now log in with:")
        print("Username: admin")
        print("Password: admin123")
        print()
        print("Or use any of the created users with password: password123")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
