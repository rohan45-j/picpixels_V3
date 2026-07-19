import datetime
from django import forms
from django.utils.safestring import mark_safe


class ModernDateTimeWidget(forms.DateTimeInput):
    """
    A modern date+time picker using HTML5 datetime-local input.
    Provides a unified calendar and clock interface in one field.
    """

    input_type = 'datetime-local'

    def __init__(self, attrs=None, format=None):
        classes = (
            'vDateField min-w-52 border border-base-200 bg-white font-medium '
            'placeholder-base-400 rounded-default px-4 py-2.5 text-sm '
            'text-font-important-light dark:text-font-important-dark '
            'dark:bg-base-900 dark:border-base-700'
        )
        attrs = {
            **(attrs or {}),
            'class': ' '.join(filter(None, [classes, (attrs or {}).get('class', '')])),
            'size': '10',
        }
        super().__init__(attrs=attrs, format=format or '%Y-%m-%dT%H:%M')

    def format_value(self, value):
        if value is None or value == '':
            return None
        if isinstance(value, datetime.datetime):
            return value.strftime('%Y-%m-%dT%H:%M')
        return value

    def value_from_datadict(self, data, files, name):
        value = data.get(name, None)
        if isinstance(value, str):
            value = value.replace('T', ' ').strip()
            if not value:
                return None
        return value


class ModernDateWidget(forms.DateInput):
    """
    A modern date picker using HTML5 date input with Unfold styling.
    Provides a native calendar interface.
    """

    input_type = 'date'

    def __init__(self, attrs=None, format=None):
        classes = (
            'vDateField min-w-52 border border-base-200 bg-white font-medium '
            'placeholder-base-400 rounded-default px-4 py-2.5 text-sm '
            'text-font-important-light dark:text-font-important-dark '
            'dark:bg-base-900 dark:border-base-700'
        )
        attrs = {
            **(attrs or {}),
            'class': ' '.join(filter(None, [classes, (attrs or {}).get('class', '')])),
            'size': '10',
        }
        super().__init__(attrs=attrs, format=format or '%Y-%m-%d')

    def format_value(self, value):
        if value is None or value == '':
            return None
        if isinstance(value, (datetime.date, datetime.datetime)):
            return value.strftime('%Y-%m-%d')
        return value


class CustomToggleSwitch(forms.CheckboxInput):
    """
    A modern SaaS-style toggle switch widget for Boolean fields.
    Replaces the default checkbox with an animated toggle switch.
    Keyboard accessible and screen-reader friendly.
    """

    def build_attrs(self, base_attrs, extra_attrs=None):
        attrs = super().build_attrs(base_attrs, extra_attrs)
        attrs['class'] = 'custom-toggle-checkbox'
        return attrs

    def render(self, name, value, attrs=None, renderer=None):
        attrs = attrs or {}
        id_str = attrs.get('id', f"id_{name}")
        checked = 'checked' if value else ''
        label_text = 'Active' if value else 'Inactive'

        html = f"""
        <div class="custom-toggle-wrapper">
            <label class="custom-toggle-container" for="{id_str}">
                <input type="checkbox" name="{name}" id="{id_str}" class="custom-toggle-checkbox" {checked}>
                <span class="custom-toggle-slider"></span>
                <span class="custom-toggle-label-text">{label_text}</span>
            </label>
        </div>
        """
        return mark_safe(html)

    def value_from_datadict(self, data, files, name):
        value = data.get(name, False)
        if isinstance(value, str):
            return value.lower() in ('true', '1', 'on', 'yes')
        return bool(value)
