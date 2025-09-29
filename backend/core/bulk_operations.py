from django.db import transaction, models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from requests_system.models import SupportRequest
from tasks.models import Task, ITPersonnel
from inventory.models import Equipment
from core.activity_logger import ActivityLogger
from core.notification_service import NotificationService
import csv
import io
import json
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class BulkOperationService:
    """Service for handling bulk operations across the system"""
    
    @staticmethod
    def bulk_assign_requests(request_ids, assigned_to_id, assigned_by):
        """Bulk assign multiple requests to a technician"""
        results = {
            'success': [],
            'failed': [],
            'total': len(request_ids)
        }
        
        try:
            assigned_to = User.objects.get(id=assigned_to_id)
            
            with transaction.atomic():
                for request_id in request_ids:
                    try:
                        request = SupportRequest.objects.get(id=request_id)
                        
                        # Check permissions
                        if not BulkOperationService._can_assign_request(assigned_by, request):
                            results['failed'].append({
                                'id': request_id,
                                'error': 'Permission denied'
                            })
                            continue
                        
                        # Update request
                        old_assigned = request.assigned_to
                        request.assigned_to = assigned_to
                        request.status = 'assigned'
                        request.assigned_at = timezone.now()
                        request.save()
                        
                        # Log activity
                        ActivityLogger.log_workflow_action(
                            user=assigned_by,
                            instance=request,
                            action_type='assign',
                            details={
                                'old_assigned_to': old_assigned.id if old_assigned else None,
                                'new_assigned_to': assigned_to.id,
                                'bulk_operation': True
                            }
                        )
                        
                        # Send notification
                        NotificationService.send_notification(
                            assigned_to,
                            f"Request Assigned: {request.ticket_number}",
                            f"You have been assigned request '{request.title}' via bulk assignment.",
                            notification_type='request_assigned',
                            related_object_type='request',
                            related_object_id=request.id
                        )
                        
                        results['success'].append(request_id)
                        
                    except SupportRequest.DoesNotExist:
                        results['failed'].append({
                            'id': request_id,
                            'error': 'Request not found'
                        })
                    except Exception as e:
                        results['failed'].append({
                            'id': request_id,
                            'error': str(e)
                        })
                        
        except User.DoesNotExist:
            return {
                'success': [],
                'failed': [{'error': 'Assigned user not found'}],
                'total': len(request_ids)
            }
        except Exception as e:
            logger.error(f"Bulk assign requests error: {str(e)}")
            return {
                'success': [],
                'failed': [{'error': 'Bulk operation failed'}],
                'total': len(request_ids)
            }
        
        return results
    
    @staticmethod
    def bulk_update_priority(model_class, object_ids, new_priority, updated_by):
        """Bulk update priority for requests or tasks"""
        results = {
            'success': [],
            'failed': [],
            'total': len(object_ids)
        }
        
        try:
            with transaction.atomic():
                for obj_id in object_ids:
                    try:
                        obj = model_class.objects.get(id=obj_id)
                        old_priority = obj.priority
                        
                        obj.priority = new_priority
                        obj.save()
                        
                        # Log activity
                        ActivityLogger.log_model_change(
                            user=updated_by,
                            instance=obj,
                            action_type='update',
                            old_values={'priority': old_priority},
                            new_values={'priority': new_priority}
                        )
                        
                        results['success'].append(obj_id)
                        
                    except model_class.DoesNotExist:
                        results['failed'].append({
                            'id': obj_id,
                            'error': f'{model_class.__name__} not found'
                        })
                    except Exception as e:
                        results['failed'].append({
                            'id': obj_id,
                            'error': str(e)
                        })
                        
        except Exception as e:
            logger.error(f"Bulk update priority error: {str(e)}")
            
        return results
    
    @staticmethod
    def bulk_close_requests(request_ids, resolution_notes, closed_by):
        """Bulk close multiple requests"""
        results = {
            'success': [],
            'failed': [],
            'total': len(request_ids)
        }
        
        try:
            with transaction.atomic():
                for request_id in request_ids:
                    try:
                        request = SupportRequest.objects.get(id=request_id)
                        
                        # Check if request can be closed
                        if request.status in ['resolved', 'closed']:
                            results['failed'].append({
                                'id': request_id,
                                'error': 'Request already closed'
                            })
                            continue
                        
                        # Update request
                        request.status = 'resolved'
                        request.resolved_at = timezone.now()
                        request.resolution_notes = resolution_notes
                        request.save()
                        
                        # Log activity
                        ActivityLogger.log_workflow_action(
                            user=closed_by,
                            instance=request,
                            action_type='complete',
                            details={
                                'resolution_notes': resolution_notes,
                                'bulk_operation': True
                            }
                        )
                        
                        # Notify requester
                        NotificationService.send_notification(
                            request.requester,
                            f"Request Resolved: {request.ticket_number}",
                            f"Your request '{request.title}' has been resolved. Resolution: {resolution_notes}",
                            notification_type='request_resolved',
                            related_object_type='request',
                            related_object_id=request.id
                        )
                        
                        results['success'].append(request_id)
                        
                    except SupportRequest.DoesNotExist:
                        results['failed'].append({
                            'id': request_id,
                            'error': 'Request not found'
                        })
                    except Exception as e:
                        results['failed'].append({
                            'id': request_id,
                            'error': str(e)
                        })
                        
        except Exception as e:
            logger.error(f"Bulk close requests error: {str(e)}")
            
        return results
    
    @staticmethod
    def bulk_update_equipment_status(equipment_ids, new_status, updated_by, notes=""):
        """Bulk update equipment status"""
        results = {
            'success': [],
            'failed': [],
            'total': len(equipment_ids)
        }
        
        try:
            with transaction.atomic():
                for equipment_id in equipment_ids:
                    try:
                        equipment = Equipment.objects.get(id=equipment_id)
                        old_status = equipment.status
                        
                        equipment.status = new_status
                        if notes:
                            equipment.notes = f"{equipment.notes}\n{timezone.now().strftime('%Y-%m-%d %H:%M')}: {notes}" if equipment.notes else notes
                        equipment.save()
                        
                        # Log activity
                        ActivityLogger.log_model_change(
                            user=updated_by,
                            instance=equipment,
                            action_type='update',
                            old_values={'status': old_status},
                            new_values={'status': new_status}
                        )
                        
                        results['success'].append(equipment_id)
                        
                    except Equipment.DoesNotExist:
                        results['failed'].append({
                            'id': equipment_id,
                            'error': 'Equipment not found'
                        })
                    except Exception as e:
                        results['failed'].append({
                            'id': equipment_id,
                            'error': str(e)
                        })
                        
        except Exception as e:
            logger.error(f"Bulk update equipment status error: {str(e)}")
            
        return results
    
    @staticmethod
    def export_data(model_class, filters=None, fields=None, user=None):
        """Export data to CSV format"""
        try:
            queryset = model_class.objects.all()
            
            # Apply filters
            if filters:
                queryset = queryset.filter(**filters)
            
            # Get field names
            if not fields:
                fields = [f.name for f in model_class._meta.fields if not f.name.endswith('_ptr')]
            
            # Create CSV
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow(fields)
            
            # Write data
            for obj in queryset:
                row = []
                for field in fields:
                    try:
                        value = getattr(obj, field)
                        if hasattr(value, 'strftime'):  # DateTime field
                            value = value.strftime('%Y-%m-%d %H:%M:%S')
                        elif hasattr(value, '__str__'):
                            value = str(value)
                        row.append(value)
                    except AttributeError:
                        row.append('')
                writer.writerow(row)
            
            # Log export activity
            if user:
                ActivityLogger.log_user_action(
                    user=user,
                    action_type='export',
                    description=f"Exported {model_class.__name__} data ({queryset.count()} records)",
                    metadata={
                        'model': model_class.__name__,
                        'record_count': queryset.count(),
                        'fields': fields,
                        'filters': filters or {}
                    }
                )
            
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Export data error: {str(e)}")
            raise
    
    @staticmethod
    def import_equipment_data(csv_data, imported_by):
        """Import equipment data from CSV"""
        results = {
            'success': [],
            'failed': [],
            'total': 0
        }
        
        try:
            csv_file = io.StringIO(csv_data)
            reader = csv.DictReader(csv_file)
            
            with transaction.atomic():
                for row_num, row in enumerate(reader, start=2):
                    results['total'] += 1
                    
                    try:
                        # Validate required fields
                        required_fields = ['name', 'asset_tag', 'category']
                        for field in required_fields:
                            if not row.get(field, '').strip():
                                raise ValidationError(f"Missing required field: {field}")
                        
                        # Create or update equipment
                        equipment, created = Equipment.objects.get_or_create(
                            asset_tag=row['asset_tag'].strip(),
                            defaults={
                                'name': row['name'].strip(),
                                'category': row.get('category', '').strip(),
                                'manufacturer': row.get('manufacturer', '').strip(),
                                'model': row.get('model', '').strip(),
                                'serial_number': row.get('serial_number', '').strip(),
                                'status': row.get('status', 'active').strip(),
                                'purchase_date': row.get('purchase_date') or None,
                                'warranty_expiry': row.get('warranty_expiry') or None,
                                'notes': row.get('notes', '').strip(),
                            }
                        )
                        
                        # Log activity
                        ActivityLogger.log_model_change(
                            user=imported_by,
                            instance=equipment,
                            action_type='create' if created else 'update',
                            metadata={
                                'import_operation': True,
                                'row_number': row_num
                            }
                        )
                        
                        results['success'].append({
                            'row': row_num,
                            'asset_tag': equipment.asset_tag,
                            'action': 'created' if created else 'updated'
                        })
                        
                    except Exception as e:
                        results['failed'].append({
                            'row': row_num,
                            'error': str(e),
                            'data': dict(row)
                        })
                        
        except Exception as e:
            logger.error(f"Import equipment data error: {str(e)}")
            results['failed'].append({
                'error': f"Import failed: {str(e)}"
            })
        
        return results
    
    @staticmethod
    def _can_assign_request(user, request):
        """Check if user can assign the request"""
        if user.role in ['admin', 'staff']:
            return True
        
        if user.role == 'manager' and user.department == request.requester_department:
            return True
        
        return False


class AdvancedSearchService:
    """Advanced search capabilities across all models"""
    
    @staticmethod
    def global_search(query, user, models=None, limit=50):
        """Perform global search across multiple models"""
        if not models:
            models = [SupportRequest, Task, Equipment, User]
        
        results = {}
        
        for model in models:
            try:
                model_results = AdvancedSearchService._search_model(
                    model, query, user, limit
                )
                if model_results:
                    results[model.__name__.lower()] = model_results
            except Exception as e:
                logger.error(f"Error searching {model.__name__}: {str(e)}")
        
        return results
    
    @staticmethod
    def _search_model(model, query, user, limit):
        """Search within a specific model"""
        queryset = model.objects.all()
        
        # Apply user permissions
        if model == SupportRequest:
            if user.role == 'user':
                queryset = queryset.filter(requester=user)
            elif user.role in ['technician', 'manager']:
                queryset = queryset.filter(
                    models.Q(requester=user) |
                    models.Q(requester__department__iexact=user.department)
                )
        elif model == Task:
            if user.role == 'user':
                queryset = queryset.filter(assigned_to__user=user)
            elif user.role == 'technician':
                queryset = queryset.filter(assigned_to__user=user)
        elif model == Equipment:
            if user.role == 'user':
                queryset = queryset.filter(location__department__iexact=user.department)
        
        # Apply search filters
        search_fields = AdvancedSearchService._get_search_fields(model)
        search_query = models.Q()
        
        for field in search_fields:
            search_query |= models.Q(**{f"{field}__icontains": query})
        
        queryset = queryset.filter(search_query)[:limit]
        
        # Format results
        results = []
        for obj in queryset:
            results.append({
                'id': obj.id,
                'title': str(obj),
                'type': model.__name__.lower(),
                'url': AdvancedSearchService._get_object_url(obj),
                'metadata': AdvancedSearchService._get_object_metadata(obj)
            })
        
        return results
    
    @staticmethod
    def _get_search_fields(model):
        """Get searchable fields for a model"""
        field_mapping = {
            SupportRequest: ['title', 'description', 'ticket_number'],
            Task: ['title', 'description'],
            Equipment: ['name', 'asset_tag', 'serial_number', 'manufacturer', 'model'],
            User: ['first_name', 'last_name', 'email', 'department']
        }
        return field_mapping.get(model, ['name'])
    
    @staticmethod
    def _get_object_url(obj):
        """Get URL for object"""
        model_name = obj.__class__.__name__.lower()
        return f"/{model_name}s/{obj.id}"
    
    @staticmethod
    def _get_object_metadata(obj):
        """Get metadata for search result"""
        metadata = {}
        
        if hasattr(obj, 'status'):
            metadata['status'] = obj.status
        if hasattr(obj, 'priority'):
            metadata['priority'] = obj.priority
        if hasattr(obj, 'created_at'):
            metadata['created_at'] = obj.created_at.isoformat()
        if hasattr(obj, 'department'):
            metadata['department'] = obj.department
        
        return metadata
