const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
// const statusRoutes = require('./routes/statusRoutes');
const db = require('./config/db');
const app = express();
const cors = require('cors');
app.use(cors());  // 启用 CORS 中间件

// 中间件配置
app.use(bodyParser.json());

// 配置路由
app.use('/api/auth', authRoutes);
// 模拟数据生成并存储到数据库
const generateAndStoreStatusData = () => {
    const pressure = Math.floor(Math.random() * 2000) + 'Pa';  // 随机压力
    const temperature = (Math.random() * 10 + 5).toFixed(1) + '°C';  // 随机温度
    const altitude = Math.floor(Math.random() * 100) + 'm';  // 随机高度
    const speed = (Math.random() * 5).toFixed(1) + 'm/s';  // 随机速度
    const status = Math.random() > 0.5 ? '正常' : '异常';  // 随机状态

    const query = 'INSERT INTO status_data (pressure, temperature, altitude, speed, status) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [pressure, temperature, altitude, speed, status], (err, result) => {
        if (err) {
            console.error('插入数据失败:', err);
        } else {
            console.log('成功生成并存储状态数据');
        }
    });
};

// 每 5 秒生成并存储一次数据
setInterval(generateAndStoreStatusData, 5000);

// 获取最新状态数据接口
app.get('/api/status', (req, res) => {
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



// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`服务器正在运行，端口号: ${PORT}`);
});
