# 🍰 Shohona Tortlar — Telegram Mini App

Tort va shirinliklar do'koni uchun to'liq tizim: **Telegram bot + Mini App + Admin panel**.
O'zbek va rus tillarida. Hammasi kompyuteringizda (localhost) ishlaydi.

```
shohonatortlar/
├── backend/     Node.js API + Telegram bot + Prisma (PostgreSQL)
├── miniapp/     Mijozlar uchun React Mini App
├── admin/       Ma'murlar uchun React Admin panel
├── install.bat  Paketlarni o'rnatish
├── db-setup.bat Bazani tayyorlash
└── start.bat    Hammasini ishga tushirish
```

---

## 0️⃣ Node.js o'rnatish (bir marta)

1. https://nodejs.org saytiga kiring
2. **LTS** versiyasini yuklab oling (yashil tugma)
3. O'rnatib bo'lgach **kompyuterni qayta yuklang** (yoki barcha terminal oynalarini yoping)
4. Tekshirish uchun PowerShell'da: `node -v` → `v20.x.x` chiqishi kerak

---

## 1️⃣ Neon.tech'da bepul PostgreSQL bazasi

1. https://neon.tech → **Sign up** (Google akkaunt bilan ham bo'ladi)
2. **Create project** tugmasi:
   - Project name: `shohona-tortlar`
   - Region: `Europe (Frankfurt)` — O'zbekistonga eng yaqini
3. Loyiha ochilgach **Connection string** bo'limini toping
4. **Connection string** ni nusxalang. U shunga o'xshash bo'ladi:
   ```
   postgresql://neondb_owner:AbCd1234@ep-cool-name-a1b2c3.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Shu matnni `backend/.env` faylidagi `DATABASE_URL` ga qo'ying:
   ```env
   DATABASE_URL="postgresql://neondb_owner:...@....neon.tech/neondb?sslmode=require"
   ```

> ⚠️ Qo'shtirnoqlar `"..."` saqlanib qolsin.

---

## 2️⃣ Telegram bot yaratish (BotFather)

1. Telegramda **@BotFather** ni qidiring (ko'k galochkali)
2. `/start` yuboring
3. `/newbot` yuboring
4. **Bot nomini** kiriting (ko'rinadigan nom):
   ```
   Shohona Tortlar
   ```
5. **Username** kiriting — `bot` bilan tugashi shart va band bo'lmasligi kerak:
   ```
   shohona_tortlar_bot
   ```
6. BotFather sizga token beradi:
   ```
   7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
   ```
7. Shu tokenni `backend/.env` dagi `BOT_TOKEN` ga qo'ying:
   ```env
   BOT_TOKEN="7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw"
   ```

**Botni chiroyliroq qilish (ixtiyoriy, BotFather'da):**
- `/setdescription` — bot haqida matn
- `/setuserpic` — bot rasmi
- `/setabouttext` — qisqa tavsif

> 🔒 Tokenni hech kimga bermang — u botingizga to'liq kirish huquqini beradi.

---

## 3️⃣ Paketlarni o'rnatish

**Eng oson yo'l:** `install.bat` fayliga ikki marta bosing.

Yoki qo'lda PowerShell'da:

```bash
cd backend
npm install
```

```bash
cd ../miniapp
npm install
```

```bash
cd ../admin
npm install
```

---

## 4️⃣ Bazani tayyorlash (jadvallar + mahsulotlar)

**Eng oson yo'l:** `db-setup.bat` fayliga ikki marta bosing.

Yoki qo'lda (`backend` papkasida):

```bash
npx prisma generate
```

```bash
npx prisma migrate dev --name init
```

```bash
npm run db:seed
```

Natijada 5 ta kategoriya, 15 ta mahsulot va 4 ta story bazaga yoziladi.

Bazani ko'z bilan ko'rish uchun: `npx prisma studio`

---

## 5️⃣ Ishga tushirish

**Eng oson yo'l:** `start.bat` fayliga ikki marta bosing — 3 ta oyna ochiladi.

Yoki qo'lda, **3 ta alohida** PowerShell oynasida:

```bash
cd backend
npm run dev
```

```bash
cd miniapp
npm run dev
```

```bash
cd admin
npm run dev
```

| Nima | Manzil |
|------|--------|
| Backend API | http://localhost:5000 |
| Mini App (brauzerda test) | http://localhost:5173 |
| **Admin panel** | http://localhost:5174 |

Admin panel paroli: `backend/.env` faylidagi `ADMIN_PASSWORD` qiymati.

---

## 6️⃣ Mini App'ni Telegramga ulash (HTTPS manzil)

Telegram Mini App **faqat HTTPS** manzilni qabul qiladi, `localhost` esa HTTP.
Shuning uchun kompyuteringizga vaqtinchalik HTTPS manzil olamiz.

### ✅ A varianti — Cloudflare Tunnel (tavsiya etiladi, shu o'rnatilgan)

Ro'yxatdan o'tish, token — hech narsa kerak emas. Ogohlantirish sahifasi ham chiqmaydi.

Bir marta o'rnatish:
```bash
winget install --id Cloudflare.cloudflared
```

Har safar ishga tushirish (loyiha ishlab turganda, yangi oynada):
```bash
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:5173
```

Chiqqan `https://....trycloudflare.com` havolasini:
1. `backend/.env` dagi `WEBAPP_URL` ga yozing
2. Backendni qayta ishga tushiring (`Ctrl+C` → `npm run dev`)

Botdagi doimiy 🍰 **Menyu** tugmasini ham yangilash uchun brauzerda shu manzilni oching
(`TOKEN` va `YANGI_HAVOLA` ni almashtiring):
`https://api.telegram.org/botTOKEN/setChatMenuButton?menu_button={"type":"web_app","text":"🍰 Menyu","web_app":{"url":"YANGI_HAVOLA"}}`

> ⚠️ Bepul tunnel manzili har safar o'zgaradi. Doimiy manzil kerak bo'lsa —
> Cloudflare'da bepul domen ulash yoki loyihani serverga joylash kerak.

---

### B varianti — ngrok

Telegram Mini App **faqat HTTPS** manzilni qabul qiladi. `localhost` esa HTTP.
Shuning uchun ngrok orqali kompyuteringizga vaqtinchalik HTTPS manzil olamiz.

### ngrok o'rnatish

1. https://ngrok.com/download → **Windows** versiyasini yuklang
2. ZIP ichidagi `ngrok.exe` ni masalan `C:\ngrok\` papkasiga chiqaring
3. https://dashboard.ngrok.com/signup — ro'yxatdan o'ting (bepul)
4. https://dashboard.ngrok.com/get-started/your-authtoken — tokenni nusxalang
5. PowerShell'da:
   ```bash
   C:\ngrok\ngrok.exe config add-authtoken BU_YERGA_TOKEN
   ```

### Tunnel ochish

Loyiha ishlab turganda **yangi** PowerShell oynasida:

```bash
C:\ngrok\ngrok.exe http 5173
```

Natijada shunday chiqadi:

```
Forwarding   https://a1b2-84-54-72-10.ngrok-free.app -> http://localhost:5173
```

`https://...ngrok-free.app` manzilini nusxalang.

### Botga ulash

1. `backend/.env` faylini oching va manzilni qo'ying:
   ```env
   WEBAPP_URL="https://a1b2-84-54-72-10.ngrok-free.app"
   ```
2. Backend oynasida `Ctrl+C` → qayta `npm run dev`
3. Telegramda botingizga `/start` yuboring → pastda **«🍰 Menyu va buyurtma»** tugmasi chiqadi

> ⚠️ **Muhim:** ngrok bepul versiyasida manzil har safar o'zgaradi.
> ngrok'ni qayta ishga tushirsangiz, yangi havolani `WEBAPP_URL` ga qo'yib, backendni qayta yurgizing.

> ℹ️ Birinchi ochilishda ngrok ogohlantirish sahifasini ko'rsatishi mumkin —
> **«Visit Site»** tugmasini bosing, keyin Mini App ochiladi.

### BotFather'da doimiy tugma (ixtiyoriy)

1. @BotFather → `/mybots` → botingizni tanlang
2. **Bot Settings** → **Menu Button** → **Configure menu button**
3. ngrok havolasini yuboring
4. Tugma nomini yuboring: `🍰 Menyu`

Endi botning chap pastidagi doimiy tugma orqali ham Mini App ochiladi.

---

## 7️⃣ Tekshirish ro'yxati

- [ ] Botga `/start` → til tanlash → telefon yuborish → menyu chiqdi
- [ ] «🍰 Menyu va buyurtma» → Mini App ochildi
- [ ] Katalogdan tort tanlab savatchaga qo'shildi
- [ ] «Buyurtmani tasdiqlash» → muvaffaqiyat ekrani chiqdi
- [ ] Botga «Buyurtmangiz qabul qilindi» xabari keldi
- [ ] Admin panelda (localhost:5174) buyurtma ko'rindi

---

## 🛠 Admin panel imkoniyatlari

| Bo'lim | Nima qilish mumkin |
|--------|--------------------|
| **Boshqaruv** | Bugungi buyurtmalar, tushum, mijozlar soni |
| **Buyurtmalar** | Ro'yxat, filtr, qidiruv, holatni o'zgartirish (mijozga bot orqali avtomatik xabar boradi), batafsil ko'rish, o'chirish |
| **Mahsulotlar** | Qo'shish / tahrirlash / o'chirish, narx, chegirma, rasm (telefon galereyasidan), tarkib, vazn variantlari, mashhur belgisi |
| **Kategoriyalar** | Qo'shish / tahrirlash / o'chirish |
| **Storylar** | Mini App bosh sahifasidagi aksiya storylari |
| **Mijozlar** | Botga obuna bo'lganlar ro'yxati |

Buyurtmalar sahifasi har **10 soniyada** avtomatik yangilanadi.

### 📷 Mahsulot rasmini qo'shish

Admin panel → **Mahsulotlar** → ✏️ (yoki «+ Yangi mahsulot») → **Mahsulot rasmi**:

1. **📷 Galereyadan tanlash** — telefon galereyasidan yoki kameradan surat oling
   (kompyuterda faylni to'g'ridan-to'g'ri maydonga tashlash ham mumkin);
2. rasm brauzerning o'zida tayyorlanadi: to'g'ri buriladi, **kvadrat (1:1) kadr**ga
   kesiladi, yorug'lik va ranglari kuchaytiriladi, 1200×1200 JPEG'ga siqiladi;
3. kadr noto'g'ri tushsa — **«Kadr»** slayderi bilan yuqoriga/pastga suriladi;
4. **🔗 Havola** tugmasi orqali internetdagi rasm manzilini ham qo'yish mumkin.

Rasmlar bazada (`images` jadvali) saqlanadi va `/api/images/<id>.jpg` orqali
beriladi — Render'da deploy qilinganda ham yo'qolmaydi. Mahsulotga biriktirilmagan
rasmlar bir kundan keyin avtomatik tozalanadi.

---

## ❓ Tez-tez uchraydigan muammolar

**`npm` yoki `node` topilmadi**
→ Node.js o'rnatilmagan yoki terminal qayta ochilmagan. 0-bo'limga qarang.

**`Can't reach database server` / `P1001`**
→ `backend/.env` dagi `DATABASE_URL` noto'g'ri yoki internet yo'q. Neon'dan connection string'ni qayta nusxalang.

**Botda tugma bosilganda Mini App ochilmayapti**
→ `WEBAPP_URL` `https://` bilan boshlanishi va ngrok ishlab turishi shart. Backendni qayta ishga tushiring.

**Mini App ochildi, lekin mahsulotlar chiqmadi**
→ Backend (port 5000) ishlab turganini tekshiring. `npm run db:seed` bajarilganmi?

**Admin panelga kira olmayapman**
→ Parol: `backend/.env` dagi `ADMIN_PASSWORD` qiymati.

**Rasmlar ko'rinmayapti**
→ Rasmlar bazadan (`/api/images/...`) olinadi — backend ishlab turganini tekshiring.
Baza bo'sh bo'lsa `npm run db:seed` ni bajaring. Yangi rasm qo'shish: admin panel →
Mahsulotlar → ✏️ → «📷 Galereyadan tanlash».

**Port band (`EADDRINUSE`)**
→ Eski jarayonni yoping: `taskkill /F /IM node.exe`

---

## 🔧 Sozlamalarni o'zgartirish

Hammasi `backend/.env` faylida:

| O'zgaruvchi | Nima uchun |
|-------------|------------|
| `SHOP_PHONE`, `SHOP_ADDRESS`, `SHOP_WORK_TIME` | Profil sahifasida va botda ko'rinadi |
| `DELIVERY_FEE` | Yetkazib berish narxi (so'm) |
| `FREE_DELIVERY_FROM` | Shu summadan yuqorida yetkazish bepul |
| `MIN_ORDER` | Minimal buyurtma summasi |
| `ADMIN_PASSWORD` | Admin panel paroli |
| `ADMIN_CHAT_ID` | Yangi buyurtmalar botga ham kelsin desangiz: botga `/id` yozing, chiqqan raqamni shu yerga qo'ying |

O'zgartirgandan keyin backendni qayta ishga tushiring.
