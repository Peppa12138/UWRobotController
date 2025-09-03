const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// 桌面路径（Windows 示例）
const desktopDir = path.join(require('os').homedir(), 'Desktop');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, desktopDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'recorded_' + Date.now() + '.webm');
  },
});
const upload = multer({storage: storage});

router.post('/api/save-video', upload.single('video'), (req, res) => {
  res.json({success: true, path: req.file.path});
});

module.exports = router;
