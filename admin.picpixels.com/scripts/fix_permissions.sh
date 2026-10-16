#!/usr/bin/env bash
# ==============================================================================
# PicPixels Media & Storage Permission Auto-Fixer
# Target: /var/www/picpixels_root/admin.picpixels.com/media
# ==============================================================================

set -e

MEDIA_DIR="/var/www/picpixels_root/admin.picpixels.com/media"

echo "=========================================================="
echo "🔧 PicPixels Media Storage Permission Repair"
echo "=========================================================="

if [ "$EUID" -ne 0 ]; then
    echo "⚠️ This script must be run with sudo privileges to update ownership to www-data."
    echo "Usage: sudo bash scripts/fix_permissions.sh"
    exit 1
fi

echo "📁 Ensuring media directory and standard subdirectories exist..."
mkdir -p "$MEDIA_DIR"/{uploads,portfolio,portfolio/before,portfolio/after,portfolio/gallery,portfolio/og,site,seo,free_trial_attachments,services,case_studies,blog}

echo "👤 Setting ownership to www-data:www-data..."
chown -R www-data:www-data "$MEDIA_DIR"

echo "🔒 Setting directory permissions (2775 with SGID)..."
# SGID (2775) ensures all newly created directories automatically inherit the www-data group!
find "$MEDIA_DIR" -type d -exec chmod 2775 {} +

echo "📄 Setting file permissions (664 rw-rw-r--)..."
find "$MEDIA_DIR" -type f -exec chmod 664 {} +

# Add deploy/current user to www-data group if needed
if [ -n "$SUDO_USER" ] && [ "$SUDO_USER" != "root" ]; then
    usermod -aG www-data "$SUDO_USER" || true
    echo "👥 Added user '$SUDO_USER' to group 'www-data'."
fi

echo "🧪 Testing write permissions as www-data..."
TEST_FILE="$MEDIA_DIR/.perm_test_write.tmp"
su -s /bin/bash www-data -c "touch $TEST_FILE && rm $TEST_FILE"
echo "✅ Write test passed! 'www-data' can read, write, and create files in $MEDIA_DIR."

echo "=========================================================="
echo "🎉 All media permissions repaired successfully!"
echo "=========================================================="
