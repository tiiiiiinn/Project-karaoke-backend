const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// เก็บไฟล์ที่อัปโหลด (สลิปโอนเงิน, รูปห้อง) ไว้ที่ gens-karaoke-backend/uploads
// แล้ว serve เป็น static path /uploads/<filename> (ดู app.js)
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').slice(0, 10);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!/^image\//.test(file.mimetype)) return cb(new Error('รองรับเฉพาะไฟล์รูปภาพ'));
    cb(null, true);
  },
});

// POST /api/uploads  (multipart/form-data, field name "file")
// -- ใช้ร่วมกันทั้งสลิปโอนเงิน (หน้าชำระเงิน) และรูปห้อง (หน้าตั้งค่าห้องฝั่งแอดมิน)
router.post('/', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'ไม่พบไฟล์ที่อัปโหลด' });
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(201).json({ url });
  });
});

module.exports = router;
