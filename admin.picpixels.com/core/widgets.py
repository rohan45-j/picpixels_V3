from django import forms
from django.utils.safestring import mark_safe


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
