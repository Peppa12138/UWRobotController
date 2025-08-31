const express = require('express');
server.listen(PORT, () => {
    console.log(`服务器正在运行，端口号: ${PORT}`);
    console.log(`摄像头模拟器地址: http://localhost:${PORT}/camera-simulator/camera_streamer.html`);
    console.log(`WebSocket地址: ws://localhost:${PORT}/video-stream`);
}); bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const statusRoutes = require('./routes/statusRoutes');
const videoStreamRoutes = require('./routes/videoStreamRoutes');
const VideoStreamController = require('./controllers/videoStreamController');

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

// 静态文件服务 - 用于提供摄像头模拟器页面
app.use('/camera-simulator', express.static(path.join(__dirname, '../')));

// 初始化WebSocket服务器
videoStreamController.initializeWebSocketServer(server);

// 启动服务器
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`服务器正在运行，端口号: ${PORT}`);
    console.log(`摄像头模拟器地址: http://localhost:${PORT}/camera-simulator/camera_simulator.html`);
    console.log(`WebSocket地址: ws://localhost:${PORT}/video-stream`);
});