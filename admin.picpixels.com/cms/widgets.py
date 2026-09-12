"""
Custom widgets for Django admin to provide modern UI components.
"""
from django import forms
from django.utils.safestring import mark_safe
class ModernToggleWidget(forms.CheckboxInput):
    """
    A modern toggle switch widget that renders as a sleek toggle button
    instead of a traditional checkbox.
    """

    def __init__(self, attrs=None):
        default_attrs = {
            'class': 'modern-toggle-switch',
            'data-toggle': 'toggle-switch',
        }
        if attrs:
            default_attrs.update(attrs)
        super().__init__(default_attrs)

    def render(self, name, value, attrs=None, renderer=None):
        if value:
            # ON state - Active
            status = 'active'
            label = 'Active'
            toggle_class = 'toggle-active'
        else:
            # OFF state - Inactive
            status = 'inactive'
            label = 'Inactive'
            toggle_class = 'toggle-inactive'

        html = f'''
        <div class="modern-toggle-wrapper" data-name="{name}" data-status="{status}">
            <div class="toggle-label toggle-label-{status}">{label}</div>
            <div class="toggle-switch-container">
                <div class="toggle-switch {toggle_class}" data-value="{value}">
                    <div class="toggle-slider"></div>
                </div>
            </div>
            <input type="hidden" name="{name}" value="{value}" />
        </div>
        '''
        return mark_safe(html)

    def value_from_datadict(self, data, files, name):
        value = data.get(name, False)
        if isinstance(value, str):
            return value.lower() in ('true', '1', 'on', 'yes')
        return bool(value)

    def has_changed(self, initial, data):
        return super().has_changed(initial, data)


class ContentBlockPreviewWidget(forms.Widget):
    template_name = 'admin/widgets/content_block_preview.html'

    class Media:
        css = {
            'all': ('admin/css/content_block_preview.css',)
        }
        js = ('admin/js/content_block_builder.js',)

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        
        import json
        from django.utils.safestring import mark_safe

        blocks_data = []
        if value:
            if isinstance(value, str):
                try:
                    blocks_data = json.loads(value)
                except json.JSONDecodeError:
                    pass
            elif isinstance(value, (list, dict)):
                blocks_data = value
        
        blocks_json = json.dumps(blocks_data)
        blocks_json_raw = mark_safe(blocks_json)

        categories = [
            {
                'label': 'Basic Content',
                'is_advanced': False,
                'items': [
                    {'type': 'heading', 'icon': '📝', 'label': 'Heading', 'desc': 'Titles, sub-headings'},
                    {'type': 'text', 'icon': '📄', 'label': 'Text', 'desc': 'Rich text content blocks'},
                    {'type': 'quote', 'icon': '💬', 'label': 'Quote', 'desc': 'Pull quotes or citations'},
                ]
            },
            {
                'label': 'Media Content',
                'is_advanced': False,
                'items': [
                    {'type': 'image', 'icon': '🖼️', 'label': 'Image', 'desc': 'Standard inline image'},
                    {'type': 'full_width_image', 'icon': '🌄', 'label': 'Full-Width Image', 'desc': 'Larger hero/breakout images'},
                    {'type': 'gallery', 'icon': '🖼️🖼️', 'label': 'Gallery', 'desc': 'Grid/slider of images'},
                ]
            },
            {
                'label': 'Layout Sections',
                'is_advanced': False,
                'items': [
                    {'type': 'image_with_text', 'icon': '🖼️📝', 'label': 'Image with Text', 'desc': 'Side-by-side media & text'},
                    {'type': 'divider', 'icon': '───', 'label': 'Divider', 'desc': 'Horizontal separation line'},
                    {'type': 'callout', 'icon': '📦', 'label': 'Callout Box', 'desc': 'Highlighted info/warning boxes'},
                ]
            },
            {
                'label': 'Advanced Sections',
                'is_advanced': True,
                'items': [
                    {'type': 'faq', 'icon': '❓', 'label': 'FAQ', 'desc': 'Question & answer accordions'},
                    {'type': 'list', 'icon': '📋', 'label': 'List', 'desc': 'Bullet or numbered lists'},
                    {'type': 'table', 'icon': '📑', 'label': 'Table', 'desc': 'Tabular data columns'},
                    {'type': 'step', 'icon': '🧩', 'label': 'Steps', 'desc': 'Numbered walkthrough steps'},
                    {'type': 'stats', 'icon': '📊', 'label': 'Stats', 'desc': 'Key performance indicators/numbers'},
                    {'type': 'cta', 'icon': '📢', 'label': 'CTA', 'desc': 'Call to action buttons'},
                    {'type': 'code', 'icon': '💻', 'label': 'Code', 'desc': 'Syntax highlighted code blocks'},
                ]
            }
        ]

        context.update({
            'blocks_json': blocks_json,
            'blocks_json_raw': blocks_json_raw,
            'categories': categories,
        })
        return context


class TagInputWidget(forms.Widget):
    """
    Renders a JSON array of strings as a friendly repeatable list with
    add / remove buttons — no raw JSON visible to the admin.
    """
    template_name = 'admin/widgets/tag_input.html'

    class Media:
        css = {'all': ('admin/css/tag_input.css',)}
        js = ('admin/js/tag_input.js',)

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        import json as _json
        items = []
        if value:
            if isinstance(value, str):
                try:
                    items = _json.loads(value)
                except _json.JSONDecodeError:
                    items = []
            elif isinstance(value, list):
                items = value
        context.update({
            'items_json': _json.dumps(items),
            'items': items,
            'widget_name': name,
        })
        return context

    def value_from_datadict(self, data, files, name):
        import json as _json
        raw = data.get(name)
        if raw is None:
            return '[]'
        if isinstance(raw, (list, dict)):
            return _json.dumps(raw)
        if isinstance(raw, str):
            raw = raw.strip()
            if not raw:
                return '[]'
            try:
                _json.loads(raw)
                return raw
            except _json.JSONDecodeError:
                return '[]'
        return '[]'

    def value_omitted_from_data(self, data, files, name):
        return name not in data


class ColorPickerWidget(forms.TextInput):
    """
    A modern color picker widget providing:
    - HTML5 native color wheel picker
    - Hex input field
    - Quick-select color presets (Black #000000, Brand Orange #FF8A50, Indigo #6366F1, Emerald #10B981, Crimson #EF4444, Violet #8B5CF6)
    - Reset to default black button
    """
    def __init__(self, attrs=None):
        default_attrs = {'class': 'vTextField color-hex-field', 'placeholder': '#000000'}
        if attrs:
            default_attrs.update(attrs)
        super().__init__(default_attrs)

    def render(self, name, value, attrs=None, renderer=None):
        val = value or ''
        color_val = val if (val and val.startswith('#') and len(val) in (4, 7)) else '#000000'
        html = f'''
        <div class="modern-color-picker-wrap" id="cp_wrap_{name}">
            <div class="color-picker-controls">
                <input type="color" class="color-picker-wheel" value="{color_val}"
                    oninput="var txt = document.getElementById('id_{name}'); if (txt) {{ txt.value = this.value; txt.dispatchEvent(new Event('change')); }}" />
                <input type="text" name="{name}" id="id_{name}" value="{val}" class="vTextField color-hex-field" placeholder="#000000 (Default Black)"
                    oninput="if (/^#[0-9A-Fa-f]{{6}}$/.test(this.value)) {{ var c = this.previousElementSibling; if (c) c.value = this.value; }}" />
                <button type="button" class="color-clear-btn" title="Reset to default black"
                    onclick="var txt = document.getElementById('id_{name}'); if (txt) txt.value = ''; var c = this.parentElement.querySelector('input[type=color]'); if (c) c.value = '#000000';">
                    Reset
                </button>
            </div>
            <div class="color-swatches">
                <span class="color-swatch-label">Presets:</span>
                <button type="button" class="color-swatch" style="background:#000000;" title="Default Black (#000000)"
                    onclick="var txt = document.getElementById('id_{name}'); if (txt) txt.value = '#000000'; var w = this.closest('.modern-color-picker-wrap'); if (w) w.querySelector('input[type=color]').value = '#000000';"></button>
                <button type="button" class="color-swatch" style="background:#FF8A50;" title="Brand Orange (#FF8A50)"
                    onclick="var txt = document.getElementById('id_{name}'); if (txt) txt.value = '#FF8A50'; var w = this.closest('.modern-color-picker-wrap'); if (w) w.querySelector('input[type=color]').value = '#FF8A50';"></button>
                <button type="button" class="color-swatch" style="background:#6366F1;" title="Indigo (#6366F1)"
                    onclick="var txt = document.getElementById('id_{name}'); if (txt) txt.value = '#6366F1'; var w = this.closest('.modern-color-picker-wrap'); if (w) w.querySelector('input[type=color]').value = '#6366F1';"></button>
                <button type="button" class="color-swatch" style="background:#10B981;" title="Emerald (#10B981)"
                    onclick="var txt = document.getElementById('id_{name}'); if (txt) txt.value = '#10B981'; var w = this.closest('.modern-color-picker-wrap'); if (w) w.querySelector('input[type=color]').value = '#10B981';"></button>
                <button type="button" class="color-swatch" style="background:#EF4444;" title="Red (#EF4444)"
                    onclick="var txt = document.getElementById('id_{name}'); if (txt) txt.value = '#EF4444'; var w = this.closest('.modern-color-picker-wrap'); if (w) w.querySelector('input[type=color]').value = '#EF4444';"></button>
                <button type="button" class="color-swatch" style="background:#8B5CF6;" title="Violet (#8B5CF6)"
                    onclick="var txt = document.getElementById('id_{name}'); if (txt) txt.value = '#8B5CF6'; var w = this.closest('.modern-color-picker-wrap'); if (w) w.querySelector('input[type=color]').value = '#8B5CF6';"></button>
            </div>
        </div>
        '''
        return mark_safe(html)


class LocationPickerWidget(forms.Widget):
    """
    Renders a dynamic location picker for services:
    - Pre-populates chips from SiteSetting.footer_locations
    - Allows toggle selection of preset chips
    - Allows adding custom locations
    - Automatically handles "All Locations (Global)" when empty
    """
    template_name = 'admin/widgets/location_picker.html'

    def render(self, name, value, attrs=None, renderer=None):
        from django.template.loader import render_to_string
        context = self.get_context(name, value, attrs)
        html = render_to_string(self.template_name, context)
        return mark_safe(html)

    def get_preset_locations(self):
        try:
            from site_settings.models import SiteSetting
            s = SiteSetting.objects.first()
            if s and s.footer_locations:
                return [line.split('|')[0].strip() for line in s.footer_locations.splitlines() if line.strip()]
        except Exception:
            pass
        return ['Texas', 'California', 'Florida', 'New York']

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        import json as _json
        items = []
        if value:
            if isinstance(value, str):
                try:
                    items = _json.loads(value)
                except _json.JSONDecodeError:
                    items = [x.strip() for x in value.split(',') if x.strip()]
            elif isinstance(value, list):
                items = value

        presets = self.get_preset_locations()
        all_chips = list(presets)
        for it in items:
            if it not in all_chips:
                all_chips.append(it)

        context.update({
            'widget_name': name,
            'items': items,
            'items_json': _json.dumps(items),
            'preset_locations': presets,
            'all_chips': all_chips,
        })
        return context

    def value_from_datadict(self, data, files, name):
        import json as _json
        raw = data.get(name)
        if raw is None:
            return []
        if isinstance(raw, list):
            return raw
        if isinstance(raw, str):
            raw = raw.strip()
            if not raw or raw == '[]':
                return []
            try:
                parsed = _json.loads(raw)
                return parsed if isinstance(parsed, list) else []
            except _json.JSONDecodeError:
                return [x.strip() for x in raw.split(',') if x.strip()]
        return []