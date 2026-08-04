# PicPixels — cPanel Deployment Guide

## Architecture Overview

| Domain | Stack | cPanel Feature |
|---|---|---|
| `picpixels.com` | Next.js 15 (Node.js) | **Node.js Selector** or reverse proxy |
| `admin.picpixels.com` | Django 5.2 (Python 3.12) | **Setup Python App** + Passenger WSGI |

---

## Prerequisites

- cPanel login credentials
- Git repository: `https://github.com/rohan45-j/picpixels_V3.git`
- SSH access (or Git clone via cPanel's "Git Version Control")
- **Node.js** enabled via cPanel's **Setup Node.js App** (for frontend)
- **Python** enabled via cPanel's **Setup Python App** (for backend)
- PostgreSQL database created via cPanel **PostgreSQL Database Wizard**
- SMTP credentials (if email is needed)

---

## Step 1: Backup Existing Data (Safety First)

Before deleting anything, take a backup of important files:

1. **Database** — Export via phpMyAdmin or PostgreSQL pgAdmin:
   - Backend: `admin.picpixels.com/db.sqlite3` (dev) or your PostgreSQL database (prod)
   - Run: `pg_dump -U username db_name > backup_$(date +%F).sql`

2. **Uploaded Media** — Download `admin.picpixels.com/media/` via FTP

3. **Environment Files** — Save `.env` files for both frontend and backend

4. **Current Deployment** — Use cPanel **Backup** → **Download a Full Backup**

---

## Step 2: Remove Existing Files

### Option A: Via cPanel File Manager
1. Navigate to **File Manager** → `public_html` (or domain document root)
2. Select all files/folders (Ctrl+A)
3. Click **Delete** — *except* `.htaccess` if you want to keep server config

### Option B: Via SSH (recommended)
```bash
# Navigate to your domain's document root
cd ~/public_html          # for primary domain
cd ~/picpixels.com        # for addon domain
cd ~/admin.picpixels.com  # for backend subdomain

# Remove everything except .htaccess and .env files if you want to keep them
find . -not -name '.htaccess' -not -name '.env' -delete

# Or more targeted removal (safer):
rm -rf picpixels admin.picpixels.com node_modules .next staticfiles media venv
```

> **Important**: Do **not** remove `.htaccess` (contains Passenger config for Django). Keep your `.env` files or save them before deleting.

---

## Step 3: Clone the Repository

### Via cPanel Git Version Control (easier)
1. Go to **cPanel** → **Git Version Control**
2. Click **Create**
3. Clone URL: `https://github.com/rohan45-j/picpixels_V3.git`
4. Repository Path: `/home1/picpixels/repositories/picpixels_V3` (or wherever you prefer)
5. Deployment Directory: `/home1/picpixels/` (your document root)
6. Set up auto-deploy if desired

### Via SSH (more control)
```bash
cd ~
# Remove old clone if exists
rm -rf picpixels_V3

# Fresh clone
git clone https://github.com/rohan45-j/picpixels_V3.git temp

# Move contents to document root
cp -r temp/* .
cp -r temp/.* .
rm -rf temp
```

---

## Step 4: Configure the Django Backend (`admin.picpixels.com`)

### 4.1 — Set up Python application in cPanel
1. Go to **cPanel** → **Setup Python App**
2. Click **Create Application**
3. Settings:
   - **Python version**: 3.12 (match `runtime.txt`)
   - **Application root**: `/home1/picpixels/admin.picpixels.com`
   - **Application URL**: `admin.picpixels.com`
   - **Application startup file**: `passenger_wsgi.py`
   - **Application entry point**: `application`
4. Click **Create**

### 4.2 — Create & activate virtual environment (if not auto-created)
```bash
cd ~/admin.picpixels.com
python3.12 -m venv venv
source venv/bin/activate
```

### 4.3 — Install Python dependencies
```bash
cd ~/admin.picpixels.com
source venv/bin/activate  # or the virtual env path from Step 4.1
pip install --upgrade pip
pip install -r requirements.txt
```

### 4.4 — Configure `.env` for production
Create or edit `~/admin.picpixels.com/.env`:

```bash
cd ~/admin.picpixels.com
nano .env
```

Paste this (adjust values):

```env
DEBUG=False
SECRET_KEY=your-generated-secure-key
ALLOWED_HOSTS=admin.picpixels.com,www.admin.picpixels.com,picpixels.com,www.picpixels.com
FRONTEND_URL=https://picpixels.com
DB_HOST=localhost
DB_NAME=your_cpanel_db_name
DB_USER=your_cpanel_db_user
DB_PASSWORD=your_cpanel_db_password
DB_PORT=5432
CORS_ALLOWED_ORIGINS=https://picpixels.com,https://www.picpixels.com,https://admin.picpixels.com
REDIS_URL=  # leave blank if no Redis
```

Generate a secret key:
```bash
python3.12 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 4.5 — Update `.htaccess` (already in repo — verify paths)
Your existing `.htaccess` should have correct paths. Verify in `~/admin.picpixels.com/.htaccess`:

```apache
PassengerAppRoot "/home1/picpixels/admin.picpixels.com"
PassengerBaseURI "/"
PassengerPython "/home1/picpixels/virtualenv/admin.picpixels.com/3.12/bin/python"
```

> **Note**: Match the Python version path. Change `3.11` to `3.12` if you created a Python 3.12 app.

### 4.6 — Run Django management commands
```bash
cd ~/admin.picpixels.com
source venv/bin/activate

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Create superuser (first deployment only)
python manage.py createsuperuser

# Seed initial data if needed
python manage.py seed_data  # if this command exists
```

### 4.7 — Set correct permissions
```bash
# Make sure Passenger WSGI can read all files
find ~/admin.picpixels.com -type d -exec chmod 755 {} \;
find ~/admin.picpixels.com -type f -exec chmod 644 {} \;

# Media directory needs write access
chmod -R 775 ~/admin.picpixels.com/media
chmod -R 775 ~/admin.picpixels.com/staticfiles

# Make sure passenger_wsgi.py is executable
chmod 755 ~/admin.picpixels.com/passenger_wsgi.py
```

### 4.8 — Restart the Python app
In cPanel **Setup Python App**, click the **Restart** button, or via SSH:
```bash
touch ~/admin.picpixels.com/tmp/restart.txt
```

---

## Step 5: Configure the Next.js Frontend (`picpixels`)

### 5.1 — Set up Node.js app in cPanel
1. Go to **cPanel** → **Setup Node.js App**
2. Click **Create Application**
3. Settings:
   - **Node.js version**: 20.x or 22.x (LTS)
   - **Application mode**: Production
   - **Application root**: `/home1/picpixels/picpixels`
   - **Application URL**: `picpixels.com`
   - **Application startup file**: `server.js`
   - **Environment variables**: Add `NODE_ENV=production` and `PORT=3000` (or whatever cPanel assigns)
4. Click **Create**

### 5.2 — Create production `.env` or `.env.local`
```bash
cd ~/picpixels
nano .env.local
```

```env
NEXT_PUBLIC_API_URL=https://admin.picpixels.com
```

### 5.3 — Install npm dependencies and build
```bash
cd ~/picpixels
npm ci --production=false
npm run build
```

> **Note**: If memory is limited on shared hosting, build locally and upload the `.next` folder. Or temporarily increase PHP memory (not applicable here). If build fails due to memory, try:
> ```bash
> NODE_OPTIONS="--max-old-space-size=512" npm run build
> ```

### 5.4 — Update `next.config.js` for production
Your `next.config.js` already has `output: 'standalone'` and correct remote patterns. No changes needed unless the domain changes.

### 5.5 — Restart the Node.js app
In cPanel **Setup Node.js App**, click the **Restart** button, or stop/start the app.

---

## Step 6: Verify Everything

### Backend Check
- Visit `https://admin.picpixels.com/admin/` — should see Django Unfold admin login
- Visit `https://admin.picpixels.com/api/v1/` — should see DRF API root (if public)
- Click **Restart** in cPanel **Setup Python App** if 500 error appears

### Frontend Check
- Visit `https://picpixels.com` — home page should load
- Check browser console for API connection errors
- Test a page that calls the API (e.g., `/services`, `/pricing`)

### Debugging 500 Errors
Check error logs:
```bash
cat ~/admin.picpixels.com/logs/error.log  # if available
cat ~/admin.picpixels.com/runserver_err.log
```

Or in cPanel: **Metrics** → **Errors**

---

## Common Issues & Solutions

| Problem | Likely Cause | Fix |
|---|---|---|
| Django 500 error | Missing `.env` or bad DB config | Verify `SECRET_KEY`, `DB_*` in `.env`. Run `python manage.py check --deploy` |
| `PassengerAppRoot` error | Wrong path in `.htaccess` | Update to match `pwd` output from SSH |
| Static files 404 | `collectstatic` not run | Run `python manage.py collectstatic --noinput` |
| Next.js blank page | API URL wrong | Check `NEXT_PUBLIC_API_URL` in `.env.local` |
| Node build OOM | Low memory | Use `NODE_OPTIONS="--max-old-space-size=512"` |
| CORS error in browser | `CORS_ALLOWED_ORIGINS` mismatch | Add the exact frontend URL (with `https://`) |
| Media uploads fail | Permissions on `media/` dir | `chmod -R 775 media` |
| `daphne`/channels error | Redis not available | Set `REDIS_URL=` blank in `.env` to fall back to InMemoryChannelLayer |

---

## Step 7: Final Go-Live Checklist

- [ ] Backend `.env` has `DEBUG=False`
- [ ] Frontend `.env.local` has production `NEXT_PUBLIC_API_URL`
- [ ] PostgreSQL database is created and credentials in `.env` are correct
- [ ] Migrations ran: `python manage.py migrate`
- [ ] Static files collected: `python manage.py collectstatic --noinput`
- [ ] Superuser created for admin access
- [ ] Both Python and Node.js apps are **restarted** in cPanel
- [ ] Domain DNS points to the correct server (A record or CNAME)
- [ ] SSL/HTTPS enabled via cPanel **SSL/TLS** or AutoSSL
- [ ] Smoke test all critical pages:
  - [ ] Home page (`/`)
  - [ ] Services (`/services`)
  - [ ] Pricing (`/pricing`)
  - [ ] Portfolio (`/portfolio`)
  - [ ] Blog (`/blog`)
  - [ ] Login (`/login`)
  - [ ] Admin (`/admin/`)
  - [ ] API docs (`/api/docs/`)
- [ ] Remove any `console.log` statements if present (optional cleanup)

---

## Additional Recommendations

1. **Use a subdomain for the backend**: You already have `admin.picpixels.com` — keep it.

2. **Git hooks for auto-deployment**: In cPanel **Git Version Control**, enable **Deploy on Push** to auto-pull from the repo.

3. **Cron job for SSL renewal**: cPanel AutoSSL handles this automatically.

4. **Regular backups**: Set up cPanel **Backup** → **Backup Configuration** for weekly/daily automated backups.

5. **Monitor disk usage**: `du -sh ~/admin.picpixels.com/media` — uploaded media grows over time.

6. **Security**: Never commit `.env` files. The `.gitignore` already excludes `.env` and `.env.local`.

7. **Local builds**: If cPanel build times are slow, build the Next.js app locally and upload only `.next/standalone/` + `public/` + `server.js`.

8. **Blue-green deployment**: Keep a copy of the previous deployment (`~/prev_version/`) as a quick rollback option.
