#!/usr/bin/env python3
"""
Create sample asset management data for testing
"""
import os
import sys
from pathlib import Path
import django
from datetime import timedelta
from django.utils import timezone

# Ensure project base is on sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_it.settings')
django.setup()

from django.contrib.auth import get_user_model
from inventory.models import Equipment, AssetAudit, AssetCheckout, AssetAlert

User = get_user_model()

def create_sample_data():
    print('Creating sample asset management data...')
    
    # Get existing equipment
    equipment_list = list(Equipment.objects.all())
    if not equipment_list:
        print('No equipment found. Please run the seeding script first.')
        return
    
    # Get users
    admin = User.objects.filter(role='system_admin').first()
    tech = User.objects.filter(role='technician').first()
    
    if not admin or not tech:
        print('No admin or technician users found.')
        return
    
    # Create sample asset audits
    for i, equipment in enumerate(equipment_list[:2]):
        AssetAudit.objects.get_or_create(
            name=f'Monthly Audit - {equipment.name}',
            defaults={
                'audit_type': 'physical',
                'status': 'planned' if i == 0 else 'completed',
                'scheduled_date': timezone.now().date() + timedelta(days=7),
                'auditor': admin,
                'description': f'Routine monthly audit for {equipment.name}'
            }
        )
    
    # Create sample asset checkouts
    if len(equipment_list) > 0:
        AssetCheckout.objects.get_or_create(
            equipment=equipment_list[0],
            defaults={
                'checked_out_to': tech,
                'checked_out_by': admin,
                'expected_return_date': timezone.now() - timedelta(days=2),  # Overdue
                'checkout_notes': 'Field maintenance work'
            }
        )
    
    # Create sample asset alerts
    for i, equipment in enumerate(equipment_list[:3]):
        severity = ['low', 'medium', 'high'][i % 3]
        alert_type = ['maintenance_due', 'warranty_expiring', 'location_mismatch'][i % 3]
        
        AssetAlert.objects.get_or_create(
            equipment=equipment,
            alert_type=alert_type,
            defaults={
                'title': f'{alert_type.replace("_", " ").title()} - {equipment.name}',
                'message': f'Alert for {equipment.name}: {alert_type.replace("_", " ")}',
                'severity': severity,
                'is_active': True
            }
        )
    
    print('Sample asset management data created successfully!')
    print(f'Audits: {AssetAudit.objects.count()}')
    print(f'Checkouts: {AssetCheckout.objects.count()}')
    print(f'Alerts: {AssetAlert.objects.count()}')

if __name__ == '__main__':
    create_sample_data()