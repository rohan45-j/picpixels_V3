import json
from decimal import Decimal, InvalidOperation
from django.apps import apps
from django.contrib import admin
from django.contrib.admin.models import LogEntry, CHANGE
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db import models as dj_models


@require_POST
def admin_quick_update_view(request):
    """
    Lightweight, high-speed AJAX endpoint for inline admin updates
    (toggle switches, order numbers, pricing, etc.) without full-page reloads.
    Provides instant optimistic UI updates and robust server-side validation.
    """
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'success': False, 'error': 'Staff authentication required.'}, status=403)

    # Parse JSON or POST body
    try:
        if request.content_type == 'application/json' or request.body.startswith(b'{'):
            data = json.loads(request.body.decode('utf-8'))
        else:
            data = request.POST
    except Exception as e:
        return JsonResponse({'success': False, 'error': f'Invalid request data: {str(e)}'}, status=400)

    app_label = data.get('app_label')
    model_name = data.get('model_name')
    object_id = data.get('object_id')
    field_name = data.get('field_name')
    value = data.get('value')

    if not all([app_label, model_name, object_id, field_name]):
        return JsonResponse({
            'success': False,
            'error': 'Missing required fields (app_label, model_name, object_id, field_name).'
        }, status=400)

    # Permission verification
    perm = f'{app_label}.change_{model_name.lower()}'
    if not request.user.has_perm(perm):
        return JsonResponse({
            'success': False,
            'error': f'Permission denied. You do not have permission to change this {model_name}.'
        }, status=403)

    # Model lookup
    try:
        model = apps.get_model(app_label, model_name)
    except LookupError:
        return JsonResponse({
            'success': False,
            'error': f'Model {app_label}.{model_name} not found.'
        }, status=404)

    # Field lookup
    try:
        field = model._meta.get_field(field_name)
    except Exception:
        return JsonResponse({
            'success': False,
            'error': f'Field "{field_name}" does not exist on {model_name}.'
        }, status=400)

    # Verify model is registered in admin
    model_admin = admin.site._registry.get(model)
    if not model_admin:
        return JsonResponse({
            'success': False,
            'error': f'Model {model_name} is not registered in the admin site.'
        }, status=400)

    # Check that field is allowed to be edited
    list_editable = getattr(model_admin, 'list_editable', ()) or ()
    if field_name not in list_editable and not getattr(field, 'editable', False):
        return JsonResponse({
            'success': False,
            'error': f'Field "{field_name}" is not editable.'
        }, status=400)

    # Fetch object
    try:
        obj = model.objects.get(pk=object_id)
    except model.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': f'{model_name} #{object_id} not found.'
        }, status=404)

    # Convert value according to Django field type
    try:
        if isinstance(field, dj_models.BooleanField):
            if isinstance(value, str):
                clean_value = value.strip().lower() in ('true', '1', 'yes', 'on')
            else:
                clean_value = bool(value)
        elif isinstance(field, (dj_models.IntegerField, dj_models.PositiveIntegerField, dj_models.SmallIntegerField)):
            clean_value = int(value)
        elif isinstance(field, dj_models.DecimalField):
            clean_value = Decimal(str(value).strip())
        elif isinstance(field, dj_models.FloatField):
            clean_value = float(value)
        else:
            clean_value = str(value)
    except (ValueError, TypeError, InvalidOperation) as ve:
        return JsonResponse({
            'success': False,
            'error': f'Invalid value format for {field.verbose_name or field_name}: {str(ve)}'
        }, status=400)

    # Apply change
    setattr(obj, field_name, clean_value)

    # Partial field validation
    try:
        obj.clean_fields(exclude=[f.name for f in model._meta.fields if f.name != field_name])
    except ValidationError as ve:
        err_msg = ', '.join(ve.messages) if hasattr(ve, 'messages') else str(ve)
        return JsonResponse({'success': False, 'error': err_msg}, status=400)
    except Exception:
        pass

    # Save to database (using update_fields for maximum performance)
    try:
        obj.save(update_fields=[field_name])
    except Exception:
        # Fallback to standard save if custom save doesn't support update_fields
        try:
            obj.save()
        except Exception as save_err:
            return JsonResponse({'success': False, 'error': str(save_err)}, status=500)

    # Invalidate backend cache & trigger Next.js revalidation
    try:
        from django.core.cache import cache
        cache.delete('consolidated_homepage_data_v1')
        from core.revalidation import trigger_revalidation
        trigger_revalidation(model_name, instance=obj)
    except Exception:
        pass

    # Log action in Django Admin History
    try:
        LogEntry.objects.log_action(
            user_id=request.user.pk,
            content_type_id=ContentType.objects.get_for_model(model).pk,
            object_id=str(obj.pk),
            object_repr=str(obj)[:200],
            action_flag=CHANGE,
            change_message=f'Quick updated {field_name} to {clean_value}'
        )
    except Exception:
        pass

    verbose_title = str(obj)[:40]
    field_label = getattr(field, 'verbose_name', field_name) or field_name

    return JsonResponse({
        'success': True,
        'app_label': app_label,
        'model_name': model_name,
        'object_id': object_id,
        'field_name': field_name,
        'value': clean_value,
        'title': verbose_title,
        'message': f'"{verbose_title}" {field_label} updated.'
    })
