import os
import sys
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = "Verifies, creates, and repairs media folder structure and Linux storage permissions."

    REQUIRED_DIRS = [
        'uploads',
        'portfolio',
        'portfolio/before',
        'portfolio/after',
        'portfolio/gallery',
        'portfolio/og',
        'site',
        'seo',
        'free_trial_attachments',
        'services',
        'case_studies',
        'blog',
    ]

    def handle(self, *args, **options):
        media_root = Path(settings.MEDIA_ROOT)
        self.stdout.write(self.style.NOTICE(f"[CHECK] Checking media root at: {media_root}"))

        # 1. Ensure root and subdirectories exist
        try:
            media_root.mkdir(parents=True, exist_ok=True)
            self.stdout.write(self.style.SUCCESS(f"  [OK] Media root exists: {media_root}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  [FAIL] Failed to create media root: {e}"))
            return

        for sub in self.REQUIRED_DIRS:
            target_dir = media_root / sub
            try:
                target_dir.mkdir(parents=True, exist_ok=True)
                self.stdout.write(f"  [OK] Subdirectory verified: {sub}")
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"  [WARN] Could not create {sub}: {e}"))

        # 2. Permissions adjustment (Linux / Unix)
        if os.name != 'nt':
            import pwd
            import grp

            www_uid = None
            www_gid = None

            try:
                www_uid = pwd.getpwnam('www-data').pw_uid
                www_gid = grp.getgrnam('www-data').gr_gid
            except KeyError:
                self.stdout.write(self.style.WARNING("  [INFO] www-data user/group not found on this system."))

            chown_success = True
            for root, dirs, files in os.walk(media_root):
                for d in dirs:
                    dpath = os.path.join(root, d)
                    try:
                        # 0o2775 = setgid + rwxrwxr-x
                        os.chmod(dpath, 0o2775)
                        if www_uid is not None and www_gid is not None:
                            try:
                                os.chown(dpath, www_uid, www_gid)
                            except PermissionError:
                                chown_success = False
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f"  Could not chmod {dpath}: {e}"))

                for f in files:
                    fpath = os.path.join(root, f)
                    try:
                        # 0o664 = rw-rw-r--
                        os.chmod(fpath, 0o664)
                        if www_uid is not None and www_gid is not None:
                            try:
                                os.chown(fpath, www_uid, www_gid)
                            except PermissionError:
                                chown_success = False
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f"  Could not chmod {fpath}: {e}"))

            # Chmod the root itself
            try:
                os.chmod(media_root, 0o2775)
                if www_uid is not None and www_gid is not None:
                    try:
                        os.chown(media_root, www_uid, www_gid)
                    except PermissionError:
                        chown_success = False
            except Exception:
                pass

            if not chown_success:
                self.stdout.write(self.style.WARNING(
                    "  [WARN] Note: Some files/folders could not be chowned because this command was not run as root.\n"
                    "     To enforce www-data ownership, run: sudo chown -R www-data:www-data media/"
                ))

        # 3. Test write access
        test_file = media_root / '.perm_test_write.tmp'
        try:
            with open(test_file, 'w') as f:
                f.write('write_test_ok')
            test_file.unlink()
            self.stdout.write(self.style.SUCCESS("[SUCCESS] Media storage write test PASSED!"))
        except PermissionError as pe:
            self.stdout.write(self.style.ERROR(
                f"[CRITICAL] Current process cannot write to {media_root}!\n"
                f"   Error: {pe}\n"
                f"   FIX: Run the following on your VPS:\n"
                f"        sudo chown -R www-data:www-data {media_root}\n"
                f"        sudo chmod -R 775 {media_root}\n"
                f"        sudo find {media_root} -type d -exec chmod 2775 {{}} +\n"
            ))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"[FAIL] Write test failed: {e}"))
