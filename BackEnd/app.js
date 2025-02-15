const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();
const cors = require('cors');
app.use(cors());  // 启用 CORS 中间件

// 中间件配置
app.use(bodyParser.json());

// 配置路由
app.use('/api/auth', authRoutes);



// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`服务器正在运行，端口号: ${PORT}`);
});
