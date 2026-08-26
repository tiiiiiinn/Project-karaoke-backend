# Gens Karaoke Backend API

Backend สำหรับระบบจองห้องคาราโอเกะ Gens Karaoke & Board Game ต่อกับ PostgreSQL (schema 7 ตาราง: users, shop, shop_hours, room, shop_policy, booking, payment)


## ติดตั้ง

```bash
cd gens-karaoke-backend
npm install
cp .env.example .env
```

แก้ `DATABASE_URL` ใน `.env` ให้ตรงกับที่ต่อ pgAdmin ของคุณ เช่น

```
DATABASE_URL=postgresql://postgres:รหัสผ่านของคุณ@localhost:5432/gens_karaoke
```

## รัน

```bash
npm run dev     # ใช้ nodemon, restart อัตโนมัติเวลาแก้โค้ด
# หรือ
npm start
```

เปิด `http://localhost:4000/api/health` ควรเห็น `{"ok":true}`

## Endpoint ทั้งหมด

### ลูกค้า
- `POST /api/auth/register` `{ name, phone }`
- `POST /api/auth/login` `{ phone }`
- `GET  /api/rooms?size=S|M|L|XL|all`
- `GET  /api/rooms/:id`
- `GET  /api/rooms/:id/availability?date=YYYY-MM-DD`
- `POST /api/bookings` `{ customerId, roomId, startDatetime, endDatetime, guestCount }`
- `GET  /api/bookings/customer/:customerId`
- `PATCH /api/bookings/:id/cancel` `{ reason }`
- `POST /api/payments` `{ bookingId, amount, method, evidenceUrl }`

### แอดมิน
- `POST  /api/auth/admin-login` `{ username, password }`
- `GET   /api/admin/bookings/today`
- `PATCH /api/admin/bookings/:id/confirm`
- `PATCH /api/admin/bookings/:id/reject` `{ reason }`
- `POST  /api/admin/bookings/walkin` `{ roomId, startDatetime, endDatetime, customerName, customerPhone, adminUserId }`
- `GET   /api/admin/bookings/history`
- `PATCH /api/admin/payments/:id/verify` `{ adminUserId, approve }`
- `GET   /api/admin/shop`
- `PATCH /api/admin/shop` `{ name, taxId, phone, address, bankName, bankAccountNo, bankAccountName, peakStartTime, peakSurcharge }`
- `PATCH /api/admin/shop/hours` `{ hours: [{ dayOfWeek, openHour, closeHour }] }`
- `GET   /api/admin/rooms`
- `PATCH /api/admin/rooms/:id` `{ roomName, size, capacity, pricePerHour, imageUrl, isActive }`
- `GET   /api/admin/reports?period=day|week|month`

## หมายเหตุ

- ราคาการจอง (base_price / peak_surcharge_total / price_total) คำนวณฝั่ง backend เสมอ (ดู `src/utils/pricing.js`) ไม่รับราคาจาก frontend โดยตรง กันลูกค้าแก้ราคาเอง
- ถ้าจองเวลาที่ชนกับรายการที่ pending/confirmed อยู่แล้วในห้องเดียวกัน ฐานข้อมูลจะปฏิเสธอัตโนมัติ (exclusion constraint) — backend ดักเป็น error code `23P01` แล้วตอบ 409 กลับไป
- Login ลูกค้าใช้แค่เบอร์โทร (ตามดีไซน์เว็บ ไม่มีรหัสผ่าน) ส่วนแอดมิน login ด้วย username/password (เข้ารหัสด้วย pgcrypto `crypt()`)
