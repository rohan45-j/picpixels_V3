# 🚀 PicPixels — Client Modification & Live Update Workflow

এই গাইডটি আপনার ভবিষ্যতের কাজের জন্য একটি কমপ্লিট চিটশিট (Cheat Sheet)। যখনই ক্লায়েন্ট কোনো পরিবর্তন (Modification), নতুন ফিচার বা বাগ ফিক্স করতে বলবে, তখন আপনি নিচের ধাপগুলো অনুসরণ করবেন।

---

## 🧭 দ্রুত আপডেট চার্ট (Decision Matrix)

| আপনি যা পরিবর্তন করেছেন | লোকাল পিসির কাজ | লাইভ VPS সার্ভারের কাজ (PuTTY) |
|---|---|---|
| **১. শুধু ডিজাইন / ফ্রন্টএন্ড** (টেক্সট, UI, কালার, বাটন) | `git push` | `cd picpixels && git pull && npm run build && pm2 reload picpixels-frontend` |
| **২. শুধু ব্যাকএন্ড লজিক / API** (পাইথন কোড) | `git push` | `cd admin.picpixels.com && git pull && sudo systemctl restart picpixels-backend` |
| **৩. ডাটাবেজ মডেল পরিবর্তন** (নতুন ফিল্ড/টেবিল) | `makemigrations` + `git push` | `git pull && python manage.py migrate && sudo systemctl restart picpixels-backend` |
| **৪. নতুন ছবি / মিডিয়া আপলোড** (লোকাল থেকে লাইভে) | WinSCP দিয়ে কপি | WinSCP দিয়ে `media` ফোল্ডারে পেস্ট + `sudo chmod 777` |
| **৫. সম্পূর্ণ সাইট একসাথে আপডেট** | `git push` | নিচে দেওয়া **এক ক্লিকে ফুল আপডেট কমান্ড** চালান |

---

## 📌 স্টেপ ১: লোকাল পিসিতে কাজ করা (Local Development)

১. আপনার লোকাল কোডে ক্লায়েন্টের কাজ সম্পন্ন করুন এবং ব্রাউজারে টেস্ট করুন (`npm run dev` বা লোকাল সার্ভার দিয়ে)।
২. কাজ টেস্ট করা শেষ হলে আপনার লোকাল টার্মিনাল (VS Code বা PowerShell) থেকে GitHub-এ কোড পুশ করুন:

```bash
git add .
git commit -m "Client modification: আপনার কাজের বিবরণ লিখুন"
git push origin main
```

---

## 📌 স্টেপ ২: লাইভ VPS সার্ভারে আপডেট করা (PuTTY)

GitHub-এ পুশ করার পর আপনার **PuTTY** ওপেন করুন। আপনার যা আপডেট হয়েছে সেই অনুযায়ী নিচের কমান্ডটি রান করুন:

---

### অপশন ক: শুধু Frontend (Next.js) আপডেট হলে (সবচেয়ে বেশি লাগবে)
যদি সাইটের ডিজাইন, লেখা, পেজ বা UI চেঞ্জ করেন:

```bash
cd /var/www/picpixels_root/picpixels
git pull origin main
npm run build
chown -R deploy:deploy /var/www/picpixels_root/picpixels
su - deploy -c "pm2 restart picpixels-frontend"
```

---

### অপশন খ: শুধু Backend (Django) আপডেট হলে
যদি কোনো API, সেটিংস বা পাইথন ফাইল পরিবর্তন করেন:

```bash
cd /var/www/picpixels_root/admin.picpixels.com
git pull origin main
source venv/bin/activate
pip install -r requirements.txt            # যদি নতুন কোনো প্যাকেজ যোগ হয়
python manage.py migrate                   # যদি নতুন কোনো মাইগ্রেশন থাকে
python manage.py collectstatic --noinput   # স্ট্যাটিক ফাইলের জন্য
sudo systemctl restart picpixels-backend
```

---

### অপশন গ: এক ক্লিকে সম্পূর্ণ সাইট আপডেট (Frontend + Backend দুটোই একসাথে)
যদি আপনি ফ্রন্টএন্ড এবং ব্যাকএন্ড দুটোতেই কাজ করেন, তবে PuTTY-তে এই পুরো কমান্ডটি একবারে পেস্ট করে এন্টার দিন:

```bash
cd /var/www/picpixels_root && git pull origin main && \
(cd picpixels && npm run build && chown -R deploy:deploy /var/www/picpixels_root/picpixels && su - deploy -c "pm2 restart picpixels-frontend") && \
(cd admin.picpixels.com && source venv/bin/activate && python manage.py migrate && python manage.py collectstatic --noinput && sudo systemctl restart picpixels-backend)
```

---

## 📌 স্টেপ ৩: ছবি / মিডিয়া ফাইল আপডেট (যদি প্রয়োজন হয়)

মনে রাখবেন: **ছবি ও আপলোড করা ফাইল কখনো Git দিয়ে যায় না।**
যদি আপনি লোকাল মেশিনে কোনো নতুন ছবি বা পোর্টফোলিও আপলোড করে থাকেন এবং সেটা লাইভে পাঠাতে চান:

১. **WinSCP** ওপেন করুন।
২. আপনার লোকালের `d:\picpixels\Live_Code\admin.picpixels.com\media\` থেকে নতুন ফাইল বা ফোল্ডারটি কপি করুন।
৩. সার্ভারের `/var/www/picpixels_root/admin.picpixels.com/media/` ফোল্ডারে পেস্ট করে দিন।
৪. আপলোড শেষ হলে PuTTY-তে পারমিশন দিয়ে দিন:
   ```bash
   sudo chmod -R 777 /var/www/picpixels_root/admin.picpixels.com/media
   ```

---

## 🛠️ সমস্যা হলে ট্রাবলশুটিং (Troubleshooting)

যদি কোনো কারণে লাইভ সাইটে আপডেট না আসে বা এরর দেখায়:

| এরর বা লক্ষণ | সমাধান কমান্ড (PuTTY) |
|---|---|
| **ফ্রন্টএন্ড এরর দেখতে** | `pm2 logs picpixels-frontend --lines 50` |
| **ফ্রন্টএন্ড রিস্টার্ট দিতে** | `su - deploy -c "pm2 restart picpixels-frontend"` |
| **fatal: detected dubious ownership** | `git config --global --add safe.directory "*"` |
| **ব্যাকএন্ড এরর দেখতে** | `sudo journalctl -u picpixels-backend -n 50 --no-pager` |
| **ব্যাকএন্ড রিস্টার্ট দিতে** | `sudo systemctl restart picpixels-backend` |
| **ব্রাউজারে পুরোনো পেজ আসলে** | ব্রাউজারে `Ctrl + F5` দিয়ে হার্ড রিফ্রেশ দিন (ক্যাশ ক্লিয়ার) |

---
*Created for PicPixels Production Maintenance.*
