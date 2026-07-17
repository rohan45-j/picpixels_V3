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