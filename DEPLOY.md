# 🚀 Deploy qo'llanmasi — Render + Vercel

Loyiha uch qismdan iborat va ular ikki xizmatga taqsimlanadi:

| Qism | Qayerga | Nima uchun |
|------|---------|-----------|
| `backend/` | **Render.com** | Doimiy ishlaydigan Node jarayoni kerak (Telegram bot polling qiladi) |
| `miniapp/` | **Vercel** | Statik sayt (Telegram Mini App) |
| `admin/` | **Vercel** | Statik sayt (boshqaruv paneli) |

Ma'lumotlar bazasi allaqachon **Neon** da — uni ko'chirish shart emas.

## ⚡ Tezkor sozlash — shu loyihaning aniq qiymatlari

Loyiha deploy qilingan va ishlayapti. **Render → shohonatortlar-api → Environment** da yetishmayotgan yagona qiymat:

| Kalit | Qiymat | Nega |
|-------|--------|------|
| `WEBAPP_URL` | `https://shohonatortlar-miniapp.vercel.app` | Botdagi «🍰 Menyu va buyurtma» tugmasi Mini App'ni ochadi |

> ✅ `SELF_URL` **Render'da kerak emas** — Render `RENDER_EXTERNAL_URL` ni avtomatik beradi, keep-alive va webhook shundan ishlaydi. `SELF_URL` faqat boshqa xostingda (yoki mahalliy tunnel bilan) kerak bo'ladi.

Tekshirish: `https://shohonatortlar-api.onrender.com/api/health` →
```json
{ "ok": true, "bot": true, "webApp": "https://shohonatortlar-miniapp.vercel.app" }
```

`"webApp": null` bo'lsa — `WEBAPP_URL` hali qo'shilmagan.

Bot rejimini tekshirish (webhook ishlayotganini ko'rsatadi):
```
https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo
```
`"url": "https://shohonatortlar-api.onrender.com/telegram/webhook"` va `last_error_message` yo'qligi — hammasi joyida.

---

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
| `SELF_URL` | **Render'da shart emas** — `RENDER_EXTERNAL_URL` avtomatik beriladi. Boshqa xostingda servisning o'z manzilini yozing. |

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

### ✅ Kodga o'rnatilgan yechim: keep-alive

Backend o'zini-o'zi har 10 daqiqada "turtib" turadi (`backend/src/index.js` → `startKeepAlive()`), shu bilan birga Neon bazasiga ham yengil so'rov yuboradi. **Render'da qo'shimcha sozlash kerak emas** — `RENDER_EXTERNAL_URL` avtomatik ishlatiladi. Boshqa xostingda:

| Kalit | Qiymat |
|-------|--------|
| `SELF_URL` | Servisning o'z manzili, masalan `https://shohonatortlar-api.onrender.com` |

> Render `RENDER_EXTERNAL_URL` o'zgaruvchisini avtomatik beradi — u bo'lsa `SELF_URL` shart emas. Logda `💓 Keep-alive: har 10 daqiqada ...` chiqsa — ishlayapti.

O'chirish kerak bo'lsa: `KEEP_ALIVE=false`. Interval: `KEEP_ALIVE_MINUTES`.

### 📨 Webhook rejimi (avtomatik yoqiladi)

`SELF_URL` (yoki Render'ning `RENDER_EXTERNAL_URL`) ma'lum bo'lsa, bot **webhook** rejimiga o'zi o'tadi:

| Rejim | Qanday ishlaydi | Uxlagan servis |
|-------|-----------------|----------------|
| `polling` (eski) | Bot Telegramdan xabarlarni **o'zi so'rab turadi** | Jarayon to'xtagan — hech narsa so'ramaydi, bot **butunlay jim** |
| `webhook` (yangi) | Telegram xabarni **serverga o'zi yuboradi** | Aynan shu so'rov servisni **uyg'otadi** |

Ya'ni webhook rejimida bot eng yomon holatda ham tiriladi. Keep-alive esa uyg'onishga umuman hojat qolmasligi uchun.

Logda qaysi rejim ishlayotgani ko'rinadi:

```
📨 Bot rejimi:          webhook (https://shohonatortlar-api.onrender.com/telegram/webhook)
```

Majburan eski rejimga qaytarish kerak bo'lsa: `BOT_MODE=polling`.

> ⚠️ Bir vaqtning o'zida **bitta** nusxa ishlashi kerak. Kompyuteringizda ham bot yoqilgan bo'lsa, Render'dagisi bilan to'qnashadi.

### Qo'shimcha variantlar

| Yechim | Narxi | Izoh |
|--------|-------|------|
| **Starter tarif** | $7/oy | Hech qachon uxlamaydi. Haqiqiy do'kon uchun **eng ishonchlisi**. |
| **Tashqi "ping"** | Bepul | Keep-alive ustiga qo'shimcha kafolat: [cron-job.org](https://cron-job.org) da har 10 daqiqada `/api/health` ga so'rov qo'ying. Servis deploy paytida qayta ishga tushsa ham uyg'otadi. |

> 💡 Bepul tarifdagi 750 soat/oy limiti 24/7 ishlashga (≈730 soat) yetadi.

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

### 2.3. Himoyani o'chirish — **majburiy qadam**

Vercel yangi loyihalarni avtomatik **Deployment Protection** bilan yopadi: saytga faqat
Vercel akkauntiga kirgan odam (ya'ni siz) kira oladi. Har ikkala loyihada ham o'chiring:

**Settings** → **Deployment Protection** → **Vercel Authentication** → **Disabled** → **Save** → **Redeploy**.

Tekshirish: havolani **yashirin (Incognito) oynada** oching. Batafsil: pastdagi
[«Sayt menda ochiladi, mijozimda ochilmaydi»](#-sayt-menda-ochiladi-mijozimda-ochilmaydi) bo'limi.

> 💡 `VITE_API_URL` ni keyin o'zgartirsangiz, **qayta deploy qilish shart** — Vite bu qiymatni build paytida kodga singdiradi. Vercel → Deployments → ⋯ → **Redeploy**.

> ⚠️ **GitHub'ga push qilinganda Vercel'da `npm error ENOENT ... /vercel/path0/package.json` xatosi chiqsa** —
> loyihaning **Root Directory** si ko'rsatilmagan, ya'ni Vercel repo ildizidan build qilmoqchi bo'lyapti
> (u yerda `package.json` yo'q). Tuzatish: Vercel → loyiha → **Settings** → **Build & Deployment** →
> **Root Directory** → `miniapp` (admin loyihasi uchun `admin`) → **Save** → **Redeploy**.
>
> Vaqtinchalik yechim — shu papkaning ichidan qo'lda deploy qilish:
> ```bash
> cd miniapp && vercel --prod
> ```

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
- [ ] **Yashirin (Incognito) oynada** admin panel va Mini App ochilmoqda — ya'ni
      Vercel himoyasi o'chirilgan va havola begona odamlarda ham ishlaydi

---

## 🔒 Deploy'dan keyingi xavfsizlik ro'yxati

- [ ] Render'da `ALLOW_DEV_AUTH=false`
- [ ] `ADMIN_PASSWORD` kuchli (do'kon nomiga o'xshamagan)
- [ ] `backend/.env` GitHub'ga tushmagan (`git status` toza)
- [ ] Admin panel endi internetda ochiq — manzilini tarqatmang

---

## 🔓 «Sayt menda ochiladi, mijozimda ochilmaydi»

Bu Vercel'ning **Deployment Protection** sozlamasi. U yangi loyihalarda **avtomatik yoqiq**
bo'ladi va saytga faqat **Vercel akkauntiga kirgan** odamni qo'yadi.

Shuning uchun siz bemalol kirasiz (brauzeringiz Vercel'ga login qilgan), begona odam esa
sayt o'rniga Vercel'ning «Log in» sahifasini yoki `401 / Authentication Required` xatosini ko'radi.

> 🔎 **Tez tekshirish:** havolani brauzerning **yashirin (Incognito) oynasida** oching.
> Vercel login sahifasi chiqsa — sabab aynan shu. Admin panelning pushti «Parol» oynasi
> chiqsa — sabab boshqa, pastdagi ikkinchi bo'limga qarang.

### Yechim — himoyani o'chirish

1. [vercel.com](https://vercel.com) → **shohonatortlar-admin** loyihasini oching.
2. Yuqoridagi **Settings** → chap menyudan **Deployment Protection**.
3. **Vercel Authentication** → **Disabled** (o'chirilgan) qilib qo'ying → **Save**.
4. Shu sahifadagi **Password Protection** ham yoqiq bo'lsa, uni ham o'chiring → **Save**.
5. **Deployments** → eng yuqoridagi deploy → ⋯ → **Redeploy** (sozlama darrov ishlashi uchun).

Shundan keyin `https://shohonatortlar-admin.vercel.app/` hammada ochiladi.

> ⚠️ Bu sozlama **har bir loyiha uchun alohida**. Mini App ham begonalarda ochilmasa
> (`shohonatortlar-miniapp`), o'sha loyihada ham xuddi shu qadamlarni bajaring.
> Telegram Mini App ayniqsa muhim: Telegram brauzeri hech qachon Vercel'ga login qilmagan.

> 🔒 **Xavfsizlik haqida.** Himoya o'chgach, admin panel manzili internetda ochiq bo'ladi —
> uni faqat parol qo'riqlaydi. Shuning uchun Render'dagi `ADMIN_PASSWORD` kuchli bo'lsin
> va havolani keraksiz odamlarga tarqatmang.

---

## 🔑 «Sahifa ochilyapti, lekin parol bilan kira olmayapti»

Bu boshqa muammo: sayt yuklanyapti, ammo **backend bilan aloqa yo'q**. Sizda ishlayotgandek
ko'rinishi mumkin, chunki brauzeringizda eski kirish tokeni saqlanib qolgan va siz parol
oynasini umuman ko'rmayapsiz.

Parol oynasidagi xabarga qarang:

| Ekranda nima yozilgan | Sabab | Nima qilish |
|---|---|---|
| «Server manzili sozlanmagan» | Vercel'da `VITE_API_URL` yo'q | Settings → Environment Variables → `VITE_API_URL` = `https://shohonatortlar-api.onrender.com/api/admin` → **Redeploy** |
| «Backend manzili noto'g'ri: ... sayt sahifasi qaytdi» | `VITE_API_URL` xato yozilgan | Manzil oxiri aynan `/api/admin` ekanini tekshiring → **Redeploy** |
| «Server uyqudan uyg'onmoqda...» | Render bepul tarifi servisni uxlatgan | 1 daqiqa kuting — panel o'zi kirib ketadi |
| «Serverga ulanib bo'lmadi» | Render servisi o'chgan/yiqilgan | Render → **Logs** ni tekshiring |
| «Parol noto'g'ri» | Parol mos emas | Render → Environment → `ADMIN_PASSWORD` bilan solishtiring |

> 💡 O'zingizda ham begona odamdagidek tekshirish uchun: yashirin oynada oching yoki
> brauzer konsolida (F12) `localStorage.clear()` yozib, sahifani yangilang.

---

## 🩹 Muammolarni hal qilish

**Render: `prisma: not found`**
→ Build Command'da `--include=dev` borligini tekshiring.

**Render: `Can't reach database server`**
→ `DATABASE_URL` va `DIRECT_URL` to'g'ri ko'chirilganini, oxirida `?sslmode=require` borligini tekshiring.

**Bot ikki marta javob beryapti / «Conflict» xatosi**
→ Bot ikkita joyda ishlayapti (kompyuter + Render). Bittasini o'chiring.

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
