const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const statusRoutes = require('./routes/statusRoutes'); // 引入 statusRoutes
const db = require('./config/db');

const app = express();

// 中间件配置
app.use(cors()); // 启用 CORS 中间件
app.use(bodyParser.json());

// 配置路由
app.use('/api/auth', authRoutes);
app.use('/api/status', statusRoutes); // 使用 statusRoutes

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`服务器正在运行，端口号: ${PORT}`);
});