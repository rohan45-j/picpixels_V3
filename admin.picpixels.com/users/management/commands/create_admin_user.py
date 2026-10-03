from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import UserProfile

User = get_user_model()


class Command(BaseCommand):
    help = 'Create an admin/superuser account with proper profile'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='admin', help='Admin username')
        parser.add_argument('--email', type=str, default='admin@picpicxels.com', help='Admin email')
        parser.add_argument('--password', type=str, default='admin123456', help='Admin password')
        parser.add_argument('--role', type=str, default='admin', choices=['admin', 'manager', 'retoucher', 'client'])

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        role = options['role']

        user, created = User.objects.get_or_create(
            username=username,
            defaults={'email': email, 'is_staff': True, 'is_superuser': (role == 'admin')}
        )

        user.email = email
        user.is_staff = True
        if role == 'admin':
            user.is_superuser = True
        user.set_password(password)
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = role
        profile.save()

        action_str = 'Created' if created else 'Updated'
        self.stdout.write(self.style.SUCCESS(
            f"Successfully {action_str} user '{username}' ({email}) with role '{role}' and password '{password}'"
        ))
        self.stdout.write(self.style.NOTICE(f"Access Unfold Admin at: http://127.0.0.1:8000/admin/"))
