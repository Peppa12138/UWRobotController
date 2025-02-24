const express = require('express');
const db = require('../config/db');
const { generateAndStoreStatusData } = require('../controllers/statusController');

const router = express.Router();

// 每 5 秒生成并存储一次数据
// setInterval(generateAndStoreStatusData, 5000);

// 获取最新状态数据接口
router.get('/', (req, res) => {
    const query = 'SELECT * FROM status_data ORDER BY timestamp DESC LIMIT 1';
    db.query(query, (err, results) => {
        if (err) {
            console.error('获取数据失败:', err);
            res.status(500).send({ message: '获取状态数据失败。' });
            return;
        }
        res.status(200).json(results[0]);
    });
});

module.exports = router;