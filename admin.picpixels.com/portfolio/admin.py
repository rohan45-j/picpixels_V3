import os
import re
from django.contrib import admin
from django.db import models
from django.urls import path
from django.shortcuts import render, redirect
from django.contrib import messages
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.utils.text import slugify
from django.http import JsonResponse
from unfold.admin import ModelAdmin
from unfold.decorators import action as unfold_action
from core.widgets import CustomToggleSwitch, ModernDateWidget
from .models import Category, Service, Portfolio, PortfolioGallery, PortfolioComparison, PortfolioFAQ



@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ['name', 'show_on_homepage', 'homepage_sort_order', 'is_active', 'sort_order', 'portfolio_count']
    search_fields = ['name']
    list_editable = ['show_on_homepage', 'homepage_sort_order', 'is_active', 'sort_order']
    list_filter = ['show_on_homepage', 'is_active']
    prepopulated_fields = {'slug': ('name',)}
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    actions = ['show_on_homepage_action', 'hide_from_homepage_action']

    @admin.action(description="⭐ Show selected categories as Tabs on Home Page")
    def show_on_homepage_action(self, request, queryset):
        count = queryset.update(show_on_homepage=True)
        self.message_user(request, f"{count} category tab(s) enabled for Home page portfolio section.")

    @admin.action(description="➖ Hide selected categories from Home Page Tabs")
    def hide_from_homepage_action(self, request, queryset):
        count = queryset.update(show_on_homepage=False)
        self.message_user(request, f"{count} category tab(s) hidden from Home page.")

    def portfolio_count(self, obj):
        return obj.portfolios.count()
    portfolio_count.short_description = 'Items'


@admin.register(Service)
class ServiceAdmin(ModelAdmin):
    list_display = ['name', 'sort_order', 'portfolio_count']
    search_fields = ['name']
    list_editable = ['sort_order']
    prepopulated_fields = {'slug': ('name',)}

    def portfolio_count(self, obj):
        return obj.portfolios.count()
    portfolio_count.short_description = 'Items'


class PortfolioGalleryInline(admin.TabularInline):
    model = PortfolioGallery
    extra = 1
    fields = ['image', 'alt_text', 'sort_order']
    readonly_fields = ['image_preview']
    classes = ['sortable']
    ordering = ['sort_order']

    class Media:
        js = ('admin/js/sortable-inline.js',)
        css = {'all': ('admin/css/sortable-inline.css',)}

    def image_preview(self, obj):
        if obj.pk and obj.image:
            return format_html(
                '<img src="{}" style="width:80px;height:60px;object-fit:cover;border-radius:6px;" />',
                obj.image.url
            )
        return '-'
    image_preview.short_description = 'Preview'


class PortfolioComparisonInline(admin.TabularInline):
    model = PortfolioComparison
    extra = 0
    fields = ['before_preview', 'before_image', 'before_image_alt', 'after_preview', 'after_image', 'after_image_alt', 'label', 'sort_order']
    readonly_fields = ['before_preview', 'after_preview']

    def before_preview(self, obj):
        if obj.pk and obj.before_image:
            return format_html(
                '<img src="{}" style="width:100px;height:70px;object-fit:cover;border-radius:6px;" />',
                obj.before_image.url
            )
        return mark_safe('<span style="color:#999;font-size:0.85rem;">No image</span>')
    before_preview.short_description = 'Before Preview'

    def after_preview(self, obj):
        if obj.pk and obj.after_image:
            return format_html(
                '<img src="{}" style="width:100px;height:70px;object-fit:cover;border-radius:6px;" />',
                obj.after_image.url
            )
        return mark_safe('<span style="color:#999;font-size:0.85rem;">No image</span>')
    after_preview.short_description = 'After Preview'


@admin.register(Portfolio)
class PortfolioAdmin(ModelAdmin):
    list_display = [
        'thumbnail_preview', 'title', 'category',
        'show_on_homepage', 'homepage_sort_order',
        'is_published', 'sort_order', 'gallery_count', 'created_at'
    ]
    list_filter = ['show_on_homepage', 'is_published', 'category', 'service']
    search_fields = ['title', 'short_description', 'client']
    list_editable = ['show_on_homepage', 'homepage_sort_order', 'is_published', 'sort_order']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['image_preview', 'created_at', 'updated_at']
    inlines = [PortfolioGalleryInline, PortfolioComparisonInline]
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    actions = [
        'add_to_homepage', 'remove_from_homepage',
        'publish_selected', 'unpublish_selected',
        'bulk_delete_items', 'bulk_clear_gallery'
    ]
    change_form_template = 'admin/portfolio/portfolio/change_form.html'
    actions_list = ['bulk_create_portfolios_action']

    @unfold_action(description="⚡ Bulk Create Portfolio Items", icon="upload", url_path="bulk-upload")
    def bulk_create_portfolios_action(self, request):
        return redirect('admin:portfolio_portfolio_bulk_upload')

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('bulk-upload/', self.admin_site.admin_view(self.bulk_create_portfolios_view), name='portfolio_portfolio_bulk_upload'),
            path('<int:object_id>/quick-bulk-upload/', self.admin_site.admin_view(self.quick_bulk_upload_view), name='portfolio_portfolio_quick_bulk_upload'),
        ]
        return custom_urls + urls

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        bulk_images = request.FILES.getlist('bulk_gallery_images')
        alt_prefix = (request.POST.get('bulk_alt_prefix') or '').strip()
        if bulk_images:
            portfolio = form.instance
            current_count = portfolio.gallery.count()
            for i, file in enumerate(bulk_images, start=1):
                caption = alt_prefix or f"{portfolio.title} Image {current_count + i}"
                PortfolioGallery.objects.create(
                    portfolio=portfolio,
                    image=file,
                    alt_text=caption,
                    sort_order=current_count + i
                )
            messages.success(request, f"🎉 Successfully added {len(bulk_images)} images to '{portfolio.title}' gallery!")

    def quick_bulk_upload_view(self, request, object_id):
        """AJAX endpoint for instant bulk upload directly from the change form."""
        if request.method == 'POST':
            try:
                portfolio = Portfolio.objects.get(pk=object_id)
            except Portfolio.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'Portfolio item not found'}, status=404)

            images = request.FILES.getlist('images') or request.FILES.getlist('bulk_gallery_images')
            alt_prefix = (request.POST.get('bulk_alt_prefix') or '').strip()

            if not images:
                return JsonResponse({'status': 'error', 'message': 'No images provided for upload'}, status=400)

            current_count = portfolio.gallery.count()
            uploaded = []
            for i, file in enumerate(images, start=1):
                caption = alt_prefix or f"{portfolio.title} Image {current_count + i}"
                g = PortfolioGallery.objects.create(
                    portfolio=portfolio,
                    image=file,
                    alt_text=caption,
                    sort_order=current_count + i
                )
                uploaded.append({
                    'id': g.id,
                    'url': g.image.url if g.image else '',
                    'alt_text': g.alt_text,
                })

            return JsonResponse({
                'status': 'success',
                'message': f"Uploaded {len(uploaded)} image(s) to '{portfolio.title}' gallery!",
                'count': len(uploaded),
                'items': uploaded,
            })
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


    def bulk_create_portfolios_view(self, request):
        """Allows bulk uploading multiple images to create portfolio items all at once."""
        categories = Category.objects.filter(is_active=True).order_by('name')
        services = Service.objects.all().order_by('name')

        if request.method == 'POST':
            category_id = request.POST.get('category_id')
            service_id = request.POST.get('service_id') or None
            is_published = request.POST.get('is_published') == 'true'
            show_on_homepage = request.POST.get('show_on_homepage') == 'true'
            images = request.FILES.getlist('images')

            if not category_id:
                messages.error(request, "❌ Please choose a Category.")
                return redirect('admin:portfolio_portfolio_bulk_upload')

            if not images:
                messages.error(request, "❌ Please select at least one image file to upload.")
                return redirect('admin:portfolio_portfolio_bulk_upload')

            try:
                category = Category.objects.get(pk=category_id)
            except Category.DoesNotExist:
                messages.error(request, "❌ Invalid Category selected.")
                return redirect('admin:portfolio_portfolio_bulk_upload')

            service = Service.objects.filter(pk=service_id).first() if service_id else None

            created_count = 0
            for file in images:
                base_name = os.path.splitext(file.name)[0]
                clean_title = re.sub(r'[-_]+', ' ', base_name).strip().title()
                if not clean_title:
                    clean_title = f"{category.name} Item"

                item = Portfolio(
                    title=clean_title,
                    category=category,
                    service=service,
                    featured_image=file,
                    featured_image_alt=clean_title,
                    is_published=is_published,
                    show_on_homepage=show_on_homepage,
                    featured=show_on_homepage,
                )
                item.save()
                created_count += 1

            messages.success(
                request,
                f"🎉 Successfully created {created_count} portfolio item(s) under '{category.name}'!"
            )
            return redirect('admin:portfolio_portfolio_changelist')

        context = {
            **self.admin_site.each_context(request),
            'categories': categories,
            'services': services,
            'opts': self.model._meta,
            'title': 'Bulk Create Portfolio Items',
        }
        return render(request, 'admin/portfolio/bulk_create_portfolios.html', context)

    @admin.action(description="⭐ Show selected items on Home Page")
    def add_to_homepage(self, request, queryset):
        updated = queryset.update(show_on_homepage=True, featured=True)
        self.message_user(request, f"{updated} portfolio item(s) added to Home Page showcase.")

    @admin.action(description="➖ Remove selected items from Home Page")
    def remove_from_homepage(self, request, queryset):
        updated = queryset.update(show_on_homepage=False, featured=False)
        self.message_user(request, f"{updated} portfolio item(s) removed from Home Page showcase.")

    @admin.action(description="🚀 Publish selected portfolio items")
    def publish_selected(self, request, queryset):
        updated = queryset.update(is_published=True)
        self.message_user(request, f"{updated} portfolio item(s) published successfully.")

    @admin.action(description="⏸️ Unpublish selected portfolio items")
    def unpublish_selected(self, request, queryset):
        updated = queryset.update(is_published=False)
        self.message_user(request, f"{updated} portfolio item(s) unpublished successfully.")

    @admin.action(description="🗑️ Bulk Delete selected portfolio items & their images")
    def bulk_delete_items(self, request, queryset):
        count = queryset.count()
        for item in queryset:
            # Delete physical files
            if item.featured_image:
                try: item.featured_image.delete(save=False)
                except Exception: pass
            if item.before_image:
                try: item.before_image.delete(save=False)
                except Exception: pass
            if item.after_image:
                try: item.after_image.delete(save=False)
                except Exception: pass
            for g in item.gallery.all():
                if g.image:
                    try: g.image.delete(save=False)
                    except Exception: pass
            item.delete()
        self.message_user(request, f"🗑️ {count} portfolio item(s) and all their associated files permanently removed.")

    @admin.action(description="🧹 Clear all gallery images for selected items")
    def bulk_clear_gallery(self, request, queryset):
        total_deleted = 0
        for item in queryset:
            for g in item.gallery.all():
                if g.image:
                    try: g.image.delete(save=False)
                    except Exception: pass
                g.delete()
                total_deleted += 1
        self.message_user(request, f"🧹 Deleted {total_deleted} gallery images across selected portfolio items.")

    def gallery_count(self, obj):
        count = obj.gallery.count()
        return format_html('<span class="font-semibold text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{} images</span>', count)
    gallery_count.short_description = 'Gallery'

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name == 'completion_date':
            formfield.widget = ModernDateWidget()
        return formfield

    fieldsets = [
        ('Content', {
            'fields': ['title', 'slug', 'category', 'service', 'short_description', 'full_description']
        }),
        ('Project Details', {
            'fields': ['client', 'completion_date', 'project_url']
        }),
        ('📸 Featured Image', {
            'fields': ['featured_image', 'featured_image_alt', 'image_preview']
        }),
        ('🔄 Before / After Images', {
            'fields': ['before_image', 'before_image_alt', 'after_image', 'after_image_alt'],
            'description': 'Upload a single before/after pair. For multiple pairs, use the "Before/After Pairs" section below.',
        }),
        ('Homepage & Visibility Settings', {
            'fields': ['show_on_homepage', 'homepage_sort_order', 'is_published', 'sort_order', 'created_at', 'updated_at'],
            'description': 'Control whether this item appears on the Home page portfolio showcase and its display order.',
        }),
        ('🔍 SEO, Canonical & Schema Settings', {
            'fields': ['canonical_url', 'meta_title', 'meta_description', 'meta_keywords', 'schema_type', 'og_image'],
            'description': 'Configure per-page SEO tags, canonical URL, OpenGraph image, and Schema.org structured data.',
        }),

    ]

    def thumbnail_preview(self, obj):
        if obj.featured_image:
            return format_html(
                '<img src="{}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;" />',
                obj.featured_image.url
            )
        return mark_safe('<span style="color:#999">No image</span>')
    thumbnail_preview.short_description = 'Image'

    def image_preview(self, obj):
        if obj.featured_image:
            return format_html(
                '<img src="{}" style="max-width:400px;max-height:300px;border-radius:12px;'
                'box-shadow:0 4px 20px rgba(0,0,0,0.1);" />',
                obj.featured_image.url
            )
        return '-'
    image_preview.short_description = 'Preview'


@admin.register(PortfolioGallery)
class PortfolioGalleryAdmin(ModelAdmin):
    list_display = ['portfolio', 'image_preview', 'alt_text', 'sort_order']
    list_filter = ['portfolio__category', 'portfolio']
    search_fields = ['alt_text', 'portfolio__title']
    ordering = ['portfolio', 'sort_order']
    actions = ['bulk_delete_selected_images', 'clear_all_for_portfolio']
    actions_list = ['bulk_upload_gallery_action']

    @unfold_action(description="📤 Bulk Upload Gallery Images", icon="upload", url_path="bulk-upload")
    def bulk_upload_gallery_action(self, request):
        return redirect('admin:portfolio_portfoliogallery_bulk_upload')

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('bulk-upload/', self.admin_site.admin_view(self.bulk_upload_gallery_view), name='portfolio_portfoliogallery_bulk_upload'),
        ]
        return custom_urls + urls

    def bulk_upload_gallery_view(self, request):
        """Allows bulk uploading multiple gallery images to a chosen portfolio item."""
        portfolios = Portfolio.objects.select_related('category').filter(is_published=True).order_by('category__name', 'title')
        selected_id = request.GET.get('portfolio_id', '')

        if request.method == 'POST':
            portfolio_id = request.POST.get('portfolio_id')
            alt_text_prefix = (request.POST.get('alt_text_prefix') or '').strip()
            images = request.FILES.getlist('images')

            if not portfolio_id:
                messages.error(request, "❌ Please choose a Portfolio item.")
                return redirect('admin:portfolio_portfoliogallery_bulk_upload')

            if not images:
                messages.error(request, "❌ Please select at least one image file.")
                return redirect('admin:portfolio_portfoliogallery_bulk_upload')

            try:
                portfolio = Portfolio.objects.get(pk=portfolio_id)
            except Portfolio.DoesNotExist:
                messages.error(request, "❌ Invalid Portfolio item selected.")
                return redirect('admin:portfolio_portfoliogallery_bulk_upload')

            current_count = portfolio.gallery.count()
            created_count = 0
            for i, file in enumerate(images, start=1):
                caption = alt_text_prefix or f"{portfolio.title} Image {current_count + i}"
                PortfolioGallery.objects.create(
                    portfolio=portfolio,
                    image=file,
                    alt_text=caption,
                    sort_order=current_count + i
                )
                created_count += 1

            messages.success(
                request,
                f"🎉 Successfully uploaded {created_count} images to '{portfolio.title}' gallery!"
            )
            return redirect('admin:portfolio_portfoliogallery_changelist')

        context = {
            **self.admin_site.each_context(request),
            'portfolios': portfolios,
            'selected_portfolio_id': selected_id,
            'opts': self.model._meta,
            'title': 'Bulk Upload Gallery Images',
        }
        return render(request, 'admin/portfolio/bulk_upload_gallery.html', context)

    @admin.action(description="🗑️ Bulk Delete selected gallery images & files")
    def bulk_delete_selected_images(self, request, queryset):
        count = queryset.count()
        for g in queryset:
            if g.image:
                try: g.image.delete(save=False)
                except Exception: pass
            g.delete()
        self.message_user(request, f"🗑️ {count} gallery image(s) permanently removed from disk and database.")

    @admin.action(description="⚠️ Delete all gallery images for selected items' projects")
    def clear_all_for_portfolio(self, request, queryset):
        portfolios = {g.portfolio for g in queryset}
        total = 0
        for p in portfolios:
            for g in p.gallery.all():
                if g.image:
                    try: g.image.delete(save=False)
                    except Exception: pass
                g.delete()
                total += 1
        self.message_user(request, f"⚠️ Cleared {total} total gallery images across {len(portfolios)} projects.")

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:80px;height:60px;object-fit:cover;border-radius:6px" />',
                obj.image.url
            )
        return '-'
    image_preview.short_description = 'Preview'


@admin.register(PortfolioComparison)
class PortfolioComparisonAdmin(ModelAdmin):
    list_display = ['portfolio', 'label', 'sort_order']
    list_filter = ['portfolio']
    search_fields = ['label', 'portfolio__title']
    ordering = ['portfolio', 'sort_order']
    fieldsets = (
        (None, {
            'fields': ('portfolio', 'before_image', 'before_image_alt', 'after_image', 'after_image_alt', 'label', 'sort_order'),
        }),
    )


@admin.register(PortfolioFAQ)
class PortfolioFAQAdmin(ModelAdmin):
    list_display = ('question', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('question', 'answer')
    ordering = ('order',)
    list_fullwidth = True
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        ('Portfolio FAQ Details', {
            'fields': ('question', 'answer', 'order', 'is_active'),
            'description': 'These FAQs appear on the Portfolio page.',
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_portfolio_faq=True)

    def save_model(self, request, obj, form, change):
        obj.is_portfolio_faq = True
        super().save_model(request, obj, form, change)
