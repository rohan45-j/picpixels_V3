# PicPixels — Contabo VPS Deployment & Git Workflow Guide

এই গাইডে PicPixels প্রজেক্টের **Frontend (Next.js 15)** এবং **Backend (Django 5.2 / DRF)** Contabo VPS (Ubuntu 22.04 / 24.04 LTS)-এ প্রথমবার সেটআপ এবং পরবর্তীতে **GitHub (Pull/Push)** দিয়ে এক ক্লিকে আপডেট করার সম্পূর্ণ গাইডলাইন দেওয়া হলো।

---

## ১. আর্কিটেকচার ওভারভিউ

| কম্পোনেন্ট | স্ট্যাক / পোর্ট | প্রসেস ম্যানেজার | ডোমেইন / রাউটিং |
|---|---|---|---|
| **Frontend** | Next.js 15 (Node.js 20 LTS) : `3000` | `PM2` | `picpixels.com`, `www.picpixels.com` |
| **Backend & API** | Django 5.2 (Python 3.12) : `8000` | `Gunicorn` + `systemd` | `admin.picpixels.com` |
| **Database** | PostgreSQL 16+ : `5432` | `systemd` | Localhost (Internal secure) |
| **Web Server** | Nginx | Reverse Proxy & SSL | Let's Encrypt Certbot |
| **Bot Protection**| Cloudflare Turnstile | - | Enabled |

---

## ২. প্রথমবার Contabo VPS প্রস্তুত করা (Initial Server Setup)

SSH দিয়ে সার্ভারে লগইন করুন:
```bash
ssh root@YOUR_SERVER_IP
```

### ২.১ প্রয়োজনীয় প্যাকেজ ইন্সটল
```bash
sudo apt update && sudo apt upgrade -y

# Python 3, PostgreSQL, Nginx, Git, Certbot
sudo apt install -y python3 python3-pip python3-venv libpq-dev postgresql postgresql-contrib nginx git certbot python3-certbot-nginx curl ufw

# Node.js 20 LTS (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 গ্লোবালি ইন্সটল (Next.js প্রসেস অটো-রানের জন্য)
sudo npm install -g pm2
```

### ২.২ ফায়ারওয়াল (UFW) সক্রিয় করা
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### ২.৩ PostgreSQL ডাটাবেজ তৈরি
```bash
sudo -u postgres psql
```
PostgreSQL প্রম্পটে রান করুন:
```sql
CREATE DATABASE picpixels_db;
CREATE USER picpixels_user WITH PASSWORD 'একটি_নিরাপদ_কঠিন_পাসওয়ার্ড_দিন';
ALTER ROLE picpixels_user SET client_encoding TO 'utf8';
ALTER ROLE picpixels_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE picpixels_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE picpixels_db TO picpixels_user;
\q
```

---

## ৩. প্রজেক্ট ডিরেক্টরি ও কোড ক্লোন (Git Clone)

সার্ভারের `/var/www/` তে কোড ক্লোন করুন:
```bash
sudo mkdir -p /var/www/picpixels_root
sudo chown -R $USER:$USER /var/www/picpixels_root
cd /var/www/picpixels_root

# গিট রিপোজিটরি ক্লোন করুন
git clone https://github.com/rohan45-j/picpixels_V3.git .
```

এখন আপনার কাছে থাকবে:
- `/var/www/picpixels_root/picpixels/` (Next.js Frontend)
- `/var/www/picpixels_root/admin.picpixels.com/` (Django Backend)

---

## ৪. Django Backend কনফিগারেশন (`admin.picpixels.com`)

### ৪.১ ভার্চুয়াল এনভায়রনমেন্ট ও লাইব্রেরি
```bash
cd /var/www/picpixels_root/admin.picpixels.com
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn psycopg2-binary
```

### ৪.২ প্রোডাকশন `.env` তৈরি
```bash
cp .env.example .env
nano .env
```
ভেতরের মানগুলো প্রোডাকশনের জন্য ঠিক করুন:
```env
DEBUG=False
SECRET_KEY=একটি_লম্বা_সিক্রেট_কী_দিন_এখানে
ALLOWED_HOSTS=admin.picpixels.com,YOUR_SERVER_IP,127.0.0.1
DATABASE_URL=postgresql://picpixels_user:আপনার_পাসওয়ার্ড@localhost:5432/picpixels_db
CLOUDFLARE_TURNSTILE_SECRET_KEY=your_actual_turnstile_secret_key
CLOUDFLARE_TURNSTILE_SITE_KEY=your_actual_turnstile_site_key
BOT_PROTECTION_ENABLED=True
CORS_ALLOWED_ORIGINS=https://picpixels.com,https://www.picpixels.com
CSRF_TRUSTED_ORIGINS=https://admin.picpixels.com,https://picpixels.com
```

### ৪.৩ ডাটাবেজ মাইগ্রেশন ও স্ট্যাটিক ফাইলস
```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser  # এডমিন লগইনের জন্য ইউজার বানান
```

### ৪.৪ Gunicorn Systemd Service কনফিগার করা
```bash
sudo nano /etc/systemd/system/picpixels-backend.service
```
নিচের কনফিগটি পেস্ট করুন:
```ini
[Unit]
Description=PicPixels Django Backend (Gunicorn)
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/picpixels_root/admin.picpixels.com
EnvironmentFile=/var/www/picpixels_root/admin.picpixels.com/.env
ExecStart=/var/www/picpixels_root/admin.picpixels.com/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    core.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

পারমিশন ঠিক করে সার্ভিস চালু করুন:
```bash
sudo chown -R www-data:www-data /var/www/picpixels_root/admin.picpixels.com
sudo systemctl daemon-reload
sudo systemctl enable picpixels-backend
sudo systemctl start picpixels-backend
sudo systemctl status picpixels-backend
```

---

## ৫. Next.js Frontend কনফিগারেশন (`picpixels.com`)

### ৫.১ প্রোডাকশন `.env.local` তৈরি
```bash
cd /var/www/picpixels_root/picpixels
cp .env.example .env.local
nano .env.local
```
```env
NEXT_PUBLIC_API_URL=https://admin.picpixels.com
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=your_turnstile_public_site_key
PORT=3000
```

### ৫.২ ডিপেনডেন্সি ইন্সটল ও প্রোডাকশন বিল্ড
```bash
npm install
npm run build
```

### ৫.৩ PM2 দিয়ে ব্যাকগ্রাউন্ডে রান করা
```bash
pm2 start npm --name "picpixels-frontend" -- start
pm2 save
pm2 startup
```
*(PM2 স্ক্রিনে যে কমান্ডটি দেখাবে সেটি কপি করে টার্মিনালে এক্সিকিউট করুন)*

---

## ৬. Nginx রিভার্স প্রক্সি কনফিগারেশন

```bash
sudo nano /etc/nginx/sites-available/picpixels
```

নিচের কনফিগারেশনটি বসিয়ে দিন:

```nginx
# ---------------------------------------------
# 1. Frontend (Next.js) - picpixels.com
# ---------------------------------------------
server {
    server_name picpixels.com www.picpixels.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Next.js Static Cache
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}

# ---------------------------------------------
# 2. Backend API & Admin - admin.picpixels.com
# ---------------------------------------------
server {
    server_name admin.picpixels.com;

    client_max_body_size 100M;

    location /static/ {
        alias /var/www/picpixels_root/admin.picpixels.com/staticfiles/;
        expires 30d;
        access_log off;
    }

    location /media/ {
        alias /var/www/picpixels_root/admin.picpixels.com/media/;
        expires 30d;
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
    }
}
```

সাইট সক্রিয় করুন ও Nginx টেস্ট করে রিলোড দিন:
```bash
sudo ln -s /etc/nginx/sites-available/picpixels /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # ডিফল্ট সাইট বন্ধ করা
sudo nginx -t
sudo systemctl reload nginx
```

---

## ৭. SSL সার্টিফিকেট (Let's Encrypt HTTPS)

ডোমেইন DNS-এ `A Record` পয়েন্ট হওয়ার পর:
```bash
sudo certbot --nginx -d picpixels.com -d www.picpixels.com -d admin.picpixels.com
```
Certbot অটোমেটিকভাবে সার্টিফিকেট ইনস্টল করে Nginx কনফিগ আপডেট করে দেবে এবং অটো-রিনিউয়াল সেট করবে।

---

## ৮. দৈনিক কাজ: Git Push & Git Pull ডিপ্লয়মেন্ট ফ্লো

আপনার লোকাল মেশিনে যখনই কোনো কাজ শেষ করবেন:

### লোকাল পিসিতে (Development Machine):
```bash
git add .
git commit -m "আপনার আপডেটের মেসেজ"
git push origin main
```

### VPS সার্ভারে গিয়ে এক ক্লিকে আপডেট (Production Update):

**যদি Frontend আপডেট হয়:**
```bash
cd /var/www/picpixels_root/picpixels
git pull origin main
npm install
npm run build
pm2 reload picpixels-frontend
```

**যদি Backend আপডেট হয়:**
```bash
cd /var/www/picpixels_root/admin.picpixels.com
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart picpixels-backend
```

**অথবা এক কমান্ডে দুটোই আপডেট করতে (Full Site Update):**
```bash
cd /var/www/picpixels_root && git pull origin main && \
(cd picpixels && npm install && npm run build && pm2 reload picpixels-frontend) && \
(cd admin.picpixels.com && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput && sudo systemctl restart picpixels-backend)
```

---

## ৯. ট্রাবলশুটিং ও দরকারী কমান্ডস

- **Frontend Logs দেখা:**
  ```bash
  pm2 logs picpixels-frontend
  ```
- **Backend Logs দেখা:**
  ```bash
  sudo journalctl -u picpixels-backend -f
  ```
- **Nginx Error Logs দেখা:**
  ```bash
  sudo tail -f /var/log/nginx/error.log
  ```
- **Backend Service রিস্টার্ট:**
  ```bash
  sudo systemctl restart picpixels-backend
  ```
- **Frontend App রিস্টার্ট:**
  ```bash
  pm2 restart picpixels-frontend
  ```
