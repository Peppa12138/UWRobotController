const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const statusRoutes = require('./routes/statusRoutes');
const videoStreamRoutes = require('./routes/videoStreamRoutes');
const serverInfoRoutes = require('./routes/serverInfoRoutes');
const VideoStreamController = require('./controllers/videoStreamController');

// 导入网络配置
const { initializeNetworkConfig } = require('../FrontEnd/config/NetworkConfig');

const app = express();
const server = http.createServer(app);

// 创建视频流控制器实例
const videoStreamController = new VideoStreamController();

// 中间件配置
app.use(cors()); // 启用 CORS 中间件
app.use(bodyParser.json({ limit: '50mb' })); // 增加请求体大小限制以支持图像数据
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// 将视频控制器实例传递给app，以便在路由中使用
app.set('videoController', videoStreamController);

// 配置路由
app.use('/api/auth', authRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/video', videoStreamRoutes);
app.use('/api', serverInfoRoutes); // 服务器信息路由

// 静态文件服务 - 用于提供摄像头模拟器页面
app.use('/camera-simulator', express.static(path.join(__dirname, '../')));

// 初始化WebSocket服务器
videoStreamController.initializeWebSocketServer(server);

// 启动服务器
const PORT = process.env.PORT || 5000;

// 初始化网络配置并获取动态IP
const localIP = initializeNetworkConfig();

server.listen(PORT, '0.0.0.0', () => {
    console.log('视频流WebSocket服务器已启动');
    console.log(`服务器正在运行，端口号: ${PORT}`);
    console.log(`本机访问地址: http://localhost:${PORT}`);
    console.log(`局域网访问地址: http://${localIP}:${PORT}`);
    console.log(`摄像头模拟器地址: http://localhost:${PORT}/camera-simulator/camera_streamer.html`);
    console.log(`WebSocket地址: ws://${localIP}:${PORT}/video-stream`);
    console.log(`APP连接地址: ws://${localIP}:${PORT}/video-stream`);
});
