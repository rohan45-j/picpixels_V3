from django.core.management.base import BaseCommand
from cms.models import BlogPost


TEMPLATE_TO_BLOCK_TYPE = {
    'full_width': 'text',
    'text_only': 'text',
    'image_top': 'text',
    'image_left': 'image_with_text',
    'image_right': 'image_with_text',
}


def section_to_blocks(section):
    blocks = []
    if section.heading:
        blocks.append({
            'type': 'heading',
            'content': section.heading,
            'level': 2,
        })

    if section.content:
        blocks.append({
            'type': 'text',
            'content': section.content,
        })

    if section.image and section.template in ('image_left', 'image_right'):
        block_type = TEMPLATE_TO_BLOCK_TYPE.get(section.template, 'image')
        if block_type == 'image':
            blocks.append({
                'type': 'image',
                'src': section.image.url if hasattr(section.image, 'url') else str(section.image),
                'alt': section.image_alt or section.heading or '',
            })
        elif block_type == 'image_with_text':
            blocks.append({
                'type': 'image_with_text',
                'src': section.image.url if hasattr(section.image, 'url') else str(section.image),
                'alt': section.image_alt or section.heading or '',
                'text': section.content or '',
            })
    elif section.image and section.template == 'image_top':
        blocks.append({
            'type': 'image',
            'src': section.image.url if hasattr(section.image, 'url') else str(section.image),
            'alt': section.image_alt or section.heading or '',
        })

    return blocks


class Command(BaseCommand):
    help = 'Migrate existing BlogContentSection data into BlogPost.content_blocks'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Show what would be migrated without saving')

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        posts = BlogPost.objects.prefetch_related('content_sections').all()
        migrated = 0

        for post in posts:
            sections = post.content_sections.all().order_by('order')
            if not sections:
                continue

            existing_blocks = post.content_blocks or []
            if existing_blocks:
                self.stdout.write(
                    f'  SKIP {post.slug} — content_blocks already has {len(existing_blocks)} blocks'
                )
                continue

            new_blocks = []
            for section in sections:
                new_blocks.extend(section_to_blocks(section))

            if not new_blocks:
                continue

            if dry_run:
                self.stdout.write(f'  DRY-RUN {post.slug} — would add {len(new_blocks)} blocks')
            else:
                post.content_blocks = new_blocks
                post.save(update_fields=['content_blocks'])
                self.stdout.write(f'  MIGRATED {post.slug} — {len(new_blocks)} blocks added')

            migrated += 1

        if dry_run:
            self.stdout.write(f'\nDry run complete. {migrated} posts would be migrated.')
        else:
            self.stdout.write(
                self.style.SUCCESS(f'\nMigration complete. {migrated} posts updated.')
            )
