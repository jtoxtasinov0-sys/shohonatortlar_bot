# 🚀 Deploy qo'llanmasi — Render + Vercel

Loyiha uch qismdan iborat va ular ikki xizmatga taqsimlanadi:

| Qism | Qayerga | Nima uchun |
|------|---------|-----------|
| `backend/` | **Render.com** | Doimiy ishlaydigan Node jarayoni kerak (Telegram bot polling qiladi) |
| `miniapp/` | **Vercel** | Statik sayt (Telegram Mini App) |
| `admin/` | **Vercel** | Statik sayt (boshqaruv paneli) |

Ma'lumotlar bazasi allaqachon **Neon** da — uni ko'chirish shart emas.

> ⚠️ **Tartib muhim.** Avval Render (backend), keyin Vercel (frontend), oxirida ikkalasini bir-biriga ulash. Sababi: frontend build paytida backend manzilini biladi, backend esa Mini App manzilini bilishi kerak.

---

## 1️⃣ Render.com — backend

### 1.1. Servis yaratish

1. [render.com](https://render.com) → **Get Started** → GitHub akkaunti bilan kiring.
2. Dashboard → **New +** → **Web Service**.
3. **Build and deploy from a Git repository** → **Next**.
4. `shohonatortlar_bot` repozitoriysini toping → **Connect**.
   - Repo ko'rinmasa: **Configure account** → Render'ga repo'ga ruxsat bering.

### 1.2. Sozlamalar

Quyidagilarni aynan shunday to'ldiring:

| Maydon | Qiymat |
|--------|--------|
| **Name** | `shohonatortlar-api` |
| **Region** | `Frankfurt (EU Central)` — O'zbekistonga eng yaqini |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install --include=dev && npx prisma generate && npx prisma migrate deploy` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` (pastdagi ogohlantirishni o'qing) yoki `Starter` |

> 💡 **`--include=dev` nega kerak?** `prisma` CLI `devDependencies` ichida. `NODE_ENV=production` bo'lganda `npm install` dev paketlarni o'tkazib yuboradi va `prisma generate` «command not found» xatosi bilan yiqiladi.

### 1.3. Environment Variables

**Advanced** → **Add Environment Variable**. Qiymatlarni kompyuteringizdagi `backend/.env` faylidan ko'chiring.

| Kalit | Qiymat |
|-------|--------|
| `DATABASE_URL` | `.env` dagi qiymat (Neon pooler havolasi) |
| `DIRECT_URL` | `.env` dagi qiymat (migratsiyalar uchun) |
| `BOT_TOKEN` | `.env` dagi qiymat |
| `NODE_ENV` | `production` |
| `ALLOW_DEV_AUTH` | `false` ← **majburiy, pastga qarang** |
| `ADMIN_PASSWORD` | `.env` dagi qiymat |
| `ADMIN_TOKEN` | `.env` dagi qiymat |
| `ADMIN_CHAT_ID` | `.env` dagi qiymat (ixtiyoriy) |
| `SHOP_NAME` | `.env` dagi qiymat |
| `SHOP_PHONE` | `.env` dagi qiymat |
| `SHOP_ADDRESS` | `.env` dagi qiymat |
| `SHOP_WORK_TIME` | `.env` dagi qiymat |
| `SHOP_INSTAGRAM` | `.env` dagi qiymat |
| `DELIVERY_FEE` | `15000` |
| `FREE_DELIVERY_FROM` | `300000` |
| `MIN_ORDER` | `30000` |
| `WEBAPP_URL` | **Hozircha bo'sh qoldiring** — 3-bosqichda to'ldiramiz |

> 🚫 **`PORT` ni QO'SHMANG.** Render uni o'zi beradi. Qo'lda yozsangiz, servis tashqaridan ochilmaydi.

> 🔒 **`ALLOW_DEV_AUTH=false` nega majburiy?**
> `backend/src/middlewares/auth.middleware.js:69` da: agar so'rovda Telegram imzosi bo'lmasa va bu sozlama yoqiq bo'lsa, server **soxta test foydalanuvchi** yaratib, kirishga ruxsat beradi. Internetda bu har kimga buyurtma yaratish imkonini beradi.
> Ayni paytda `backend/src/config/default.js:40` da standart qiymat `true` — ya'ni o'zgaruvchini **umuman qo'shmasangiz ham xavf saqlanadi**. Shuning uchun uni aniq `false` qilib yozing.

### 1.4. Ishga tushirish

**Create Web Service** → birinchi deploy 3-7 daqiqa davom etadi.

**Logs** bo'limida quyidagilarni ko'rishingiz kerak:

```
✅ Ma'lumotlar bazasiga ulandi
🚀 API ishlayapti
🤖 Bot ishlayapti: @sizning_botingiz
```

### 1.5. Tekshirish

Brauzerda oching:

```
https://shohonatortlar-api.onrender.com/api/health
```

Kutilgan javob:

```json
{ "ok": true, "bot": true, "webApp": null, "time": "..." }
```

`"bot": true` bo'lsa — bot ulandi. `webApp` hozircha `null`, bu normal.

### 1.6. Bazani to'ldirish (agar bo'sh bo'lsa)

Migratsiyalar build paytida avtomatik bajariladi, lekin boshlang'ich mahsulotlar qo'shilmaydi. Neon bazasi internetdan ochiq bo'lgani uchun buni **o'z kompyuteringizdan** bajarish eng oson:

```bash
cd backend
npm run db:seed
```

---

## ⚠️ Free tarif haqida muhim ogohlantirish

Render'ning bepul tarifi **15 daqiqa harakatsizlikdan keyin servisni uxlatadi**. Bot esa "long polling" usulida ishlaydi — ya'ni **doimiy yoqiq turishi kerak**. Servis uxlagach:

- Bot Telegram'da javob bermay qoladi
- Keyingi so'rov servisni uyg'otadi, lekin bu **~50 soniya** davom etadi

Uch yechim bor:

| Yechim | Narxi | Izoh |
|--------|-------|------|
| **Starter tarif** | $7/oy | Hech qachon uxlamaydi. Haqiqiy do'kon uchun **tavsiya etiladi**. |
| **Tashqi "ping"** | Bepul | [cron-job.org](https://cron-job.org) da har 10 daqiqada `https://shohonatortlar-api.onrender.com/api/health` ga so'rov qo'ying. Bepul tarifdagi 750 soat/oy limitiga sig'adi (24/7 ≈ 730 soat). |
| **Webhook'ga o'tish** | Bepul | Kod o'zgarishi talab qiladi va sovuq start tufayli birinchi xabarlar yo'qolishi mumkin. |

---

## 2️⃣ Vercel — frontend (2 ta loyiha)

Bitta repozitoriydan **ikkita alohida** Vercel loyihasi yaratiladi.

### 2.1. Mini App

1. [vercel.com](https://vercel.com) → GitHub bilan kiring.
2. **Add New...** → **Project** → `shohonatortlar_bot` → **Import**.
3. Sozlamalar:

| Maydon | Qiymat |
|--------|--------|
| **Project Name** | `shohonatortlar-miniapp` |
| **Root Directory** | `miniapp` ← **Edit** tugmasi orqali tanlang |
| **Framework Preset** | `Vite` (avtomatik aniqlanadi) |

4. **Environment Variables** bo'limini oching va qo'shing:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://shohonatortlar-api.onrender.com/api` |

5. **Deploy**.

### 2.2. Admin panel

Yana **Add New...** → **Project** → o'sha repo → **Import**:

| Maydon | Qiymat |
|--------|--------|
| **Project Name** | `shohonatortlar-admin` |
| **Root Directory** | `admin` |
| **Framework Preset** | `Vite` |

Environment Variable — **e'tibor bering, oxiri boshqacha**:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://shohonatortlar-api.onrender.com/api/admin` |

**Deploy**.

> ⚠️ Ikkala manzil bir xil emas: Mini App uchun `/api`, admin uchun `/api/admin`. Adashtirsangiz, panel ishlamaydi.

> 💡 `VITE_API_URL` ni keyin o'zgartirsangiz, **qayta deploy qilish shart** — Vite bu qiymatni build paytida kodga singdiradi. Vercel → Deployments → ⋯ → **Redeploy**.

---

## 3️⃣ Ulash

### 3.1. Backend'ga Mini App manzilini berish

1. Render → `shohonatortlar-api` → **Environment**.
2. `WEBAPP_URL` ni Vercel bergan Mini App manzili bilan to'ldiring, masalan:
   `https://shohonatortlar-miniapp.vercel.app`
3. **Save Changes** — servis avtomatik qayta ishga tushadi.

Tekshirish: `/api/health` endi `"webApp": "https://..."` qaytarishi kerak.

### 3.2. BotFather'da Mini App'ni sozlash

Telegram'da [@BotFather](https://t.me/BotFather):

1. `/mybots` → botingizni tanlang → **Bot Settings** → **Menu Button** → **Configure Menu Button**
2. Manzilni yuboring: `https://shohonatortlar-miniapp.vercel.app`
3. Tugma nomini yozing, masalan: `🍰 Menyu`

### 3.3. Yakuniy tekshiruv

- [ ] Botga `/start` — javob bermoqda
- [ ] «Menyu» tugmasi Mini App'ni ochmoqda
- [ ] Mahsulotlar ko'rinmoqda
- [ ] Test buyurtma o'tmoqda
- [ ] Admin panel ochilib, parol bilan kirmoqda
- [ ] Buyurtma admin panelda ko'rinmoqda

---

## 🔒 Deploy'dan keyingi xavfsizlik ro'yxati

- [ ] Render'da `ALLOW_DEV_AUTH=false`
- [ ] `ADMIN_PASSWORD` kuchli (do'kon nomiga o'xshamagan)
- [ ] `backend/.env` GitHub'ga tushmagan (`git status` toza)
- [ ] Admin panel endi internetda ochiq — manzilini tarqatmang

---

## 🩹 Muammolarni hal qilish

**Render: `prisma: not found`**
→ Build Command'da `--include=dev` borligini tekshiring.

**Render: `Can't reach database server`**
→ `DATABASE_URL` va `DIRECT_URL` to'g'ri ko'chirilganini, oxirida `?sslmode=require` borligini tekshiring.

**Render: servis ishga tushdi, lekin bot jim**
→ `/api/health` da `"bot": false` bo'lsa, `BOT_TOKEN` noto'g'ri. `true` bo'lsa-yu bot jim bo'lsa — servis uxlagan (yuqoridagi ogohlantirishga qarang).

**Mini App: «Server xatosi» yoki mahsulotlar chiqmayapti**
→ Brauzer konsolini oching (F12). CORS xatosi bo'lsa — `VITE_API_URL` noto'g'ri. 404 bo'lsa — manzil oxiridagi `/api` tushib qolgan.

**Mini App ochilyapti, lekin «Telegram ma'lumotlari tasdiqlanmadi»**
→ Render'dagi `BOT_TOKEN` Mini App ulangan bot bilan bir xil emas.

**Admin panel: parol to'g'ri, lekin kirmayapti**
→ `VITE_API_URL` oxiri `/api/admin` ekanini tekshiring. Render'dagi `ADMIN_PASSWORD` ni ham solishtiring.

**Vercel: build muvaffaqiyatli, lekin sayt oq ekran**
→ **Root Directory** noto'g'ri tanlangan (`miniapp` yoki `admin` bo'lishi kerak).
