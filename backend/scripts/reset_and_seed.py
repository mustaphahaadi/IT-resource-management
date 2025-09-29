#!/usr/bin/env python3
"""
Reset and seed minimal data for Hospital IT Resource Management System.
- Creates auto-approved and email-verified admin (system_admin)
- Creates a technician (approved) and an end user (pending approval)
- Seeds core inventory entities, request categories, and example requests
"""
import os
import sys
from pathlib import Path
import django
from datetime import timedelta
from django.utils import timezone

# Ensure project base is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_it.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from inventory.models import Department, Location, Vendor, EquipmentCategory, Equipment
from requests_system.models import RequestCategory, SupportRequest

User = get_user_model()


def upsert_user(email, username, first_name, last_name, password,
                role='end_user', is_staff=False, is_superuser=False,
                is_approved=False, is_email_verified=False, department='other'):
    u, created = User.objects.get_or_create(email=email, defaults={
        'username': username,
        'first_name': first_name,
        'last_name': last_name,
        'is_staff': is_staff,
        'is_superuser': is_superuser,
        'role': role,
        'is_approved': is_approved,
        'is_email_verified': is_email_verified,
        'department': department,
    })
    if created:
        u.set_password(password)
        u.save()
    else:
        u.username = username
        u.first_name = first_name
        u.last_name = last_name
        u.is_staff = is_staff
        u.is_superuser = is_superuser
        u.role = role
        u.is_approved = is_approved
        u.is_email_verified = is_email_verified
        u.department = department
        u.set_password(password)
        u.save()
    Token.objects.get_or_create(user=u)
    return u


def seed_users():
    print('Seeding users...')
    admin = upsert_user(
        email='admin@hospital.com', username='admin', first_name='Admin', last_name='User',
        password='admin123', role='system_admin', is_staff=True, is_superuser=True,
        is_approved=True, is_email_verified=True, department='it'
    )
    tech = upsert_user(
        email='tech.jane@hospital.com', username='tech_jane', first_name='Jane', last_name='Doe',
        password='password123', role='technician', is_staff=True, is_superuser=False,
        is_approved=True, is_email_verified=True, department='it'
    )
    end_user = upsert_user(
        email='enduser.bob@hospital.com', username='end_user_bob', first_name='Bob', last_name='Brown',
        password='password123', role='end_user', is_staff=False, is_superuser=False,
        is_approved=False, is_email_verified=False, department='other'
    )
    print('Admin:', admin.email, 'Technician:', tech.email, 'End user (pending):', end_user.email)


def seed_inventory():
    print('Seeding inventory (departments, locations, vendors, categories, equipment)...')
    dept_names = [
        ('IT', 'Information Technology Department'),
        ('Administration', 'Administration Department'),
        ('Medical', 'Medical Department'),
        ('Laboratory', 'Laboratory Department'),
        ('Nursing', 'Nursing Department'),
        ('Pharmacy', 'Pharmacy Department'),
    ]
    departments = {}
    for name, desc in dept_names:
        d, _ = Department.objects.get_or_create(name=name, defaults={'description': desc})
        departments[name] = d
    # Locations
    locations = {}
    for name, dept in departments.items():
        loc, _ = Location.objects.get_or_create(
            building='Main Hospital', floor='1st Floor', room=f'{name} Room 101', department=dept
        )
        locations[name] = loc
    # Vendors
    vendors_data = [
        ('Dell Technologies', 'sales@dell.com', '+1-800-DELL', 'Round Rock, TX'),
        ('HP Inc.', 'sales@hp.com', '+1-800-HP-HELP', 'Palo Alto, CA'),
        ('Cisco Systems', 'sales@cisco.com', '+1-800-CISCO', 'San Jose, CA'),
    ]
    vendors = {}
    for name, email, phone, addr in vendors_data:
        v, _ = Vendor.objects.get_or_create(name=name, defaults={'contact_email': email, 'contact_phone': phone, 'address': addr})
        vendors[name] = v
    # Categories
    cats_data = [
        ('Computer', 'Desktop and laptop computers'),
        ('Network Equipment', 'Network devices'),
        ('Printer', 'Printers and MFDs'),
        ('Server', 'Server hardware'),
    ]
    cats = {}
    for name, desc in cats_data:
        c, _ = EquipmentCategory.objects.get_or_create(name=name, defaults={'description': desc})
        cats[name] = c
    # Equipment examples
    eq_examples = [
        ('Dell OptiPlex 7090', 'DL-001', 'OptiPlex 7090', 'Dell', 'Computer', 'IT', 'active', 'Dell Technologies'),
        ('Cisco Catalyst 2960', 'CS-001', 'Catalyst 2960', 'Cisco', 'Network Equipment', 'IT', 'active', 'Cisco Systems'),
        ('HP LaserJet Pro 400', 'HP-002', 'LaserJet Pro 400', 'HP', 'Printer', 'Administration', 'active', 'HP Inc.'),
    ]
    for name, asset_tag, model, manufacturer, cat_name, dept_name, status, vendor_name in eq_examples:
        Equipment.objects.get_or_create(
            asset_tag=asset_tag,
            defaults={
                'name': name,
                'model': model,
                'manufacturer': manufacturer,
                'category': cats[cat_name],
                'location': locations[dept_name],
                'vendor': vendors[vendor_name],
                'status': status,
                'purchase_date': timezone.now().date() - timedelta(days=60),
                'warranty_expiry': timezone.now().date() + timedelta(days=365),
                'purchase_cost': 1200,
            }
        )


def seed_requests():
    print('Seeding request categories and sample support requests...')
    cats = {}
    for name, desc in [
        ('Hardware', 'Hardware related issues'),
        ('Software', 'Software related issues'),
        ('Network', 'Network connectivity issues'),
        ('Access', 'Access and permissions'),
        ('General', 'General IT support'),
    ]:
        c, _ = RequestCategory.objects.get_or_create(name=name, defaults={'description': desc})
        cats[name] = c

    requester = User.objects.filter(role='end_user').first() or User.objects.first()
    if requester:
        SupportRequest.objects.get_or_create(
            title='Computer won\'t start - Seed',
            defaults={
                'description': 'The computer in room 205 will not turn on.',
                'priority': 'high',
                'status': 'open',
                'category': cats['Hardware'],
                'requester_department': 'IT',
                'requester_location': 'IT Department, Room 101',
                'requester': requester,
            }
        )
        SupportRequest.objects.get_or_create(
            title='Network outage on 3rd floor - Seed',
            defaults={
                'description': 'Users report no network connectivity on 3rd floor.',
                'priority': 'critical',
                'status': 'open',
                'category': cats['Network'],
                'requester_department': 'Administration',
                'requester_location': 'Admin Wing, Room 305',
                'requester': requester,
            }
        )


def main():
    print('=== Seeding Hospital IT minimal data ===')
    seed_users()
    seed_inventory()
    seed_requests()
    print('=== Seed complete. Admin credentials: admin@hospital.com / admin123 ===')


if __name__ == '__main__':
    main()
