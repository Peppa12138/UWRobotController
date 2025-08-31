const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const path = require('path');
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

// 基础视频API路由
app.get('/api/video/status', (req, res) => {
    try {
        const videoController = req.app.get('videoController');
        if (!videoController) {
            return res.status(500).json({
                success: false,
                message: '视频流服务未初始化'
            });
        }

        const status = videoController.getStreamStatus();
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('获取视频流状态失败:', error);
        res.status(500).json({
            success: false,
            message: '获取状态失败'
        });
    }
});

app.post('/api/video/control', (req, res) => {
    try {
        const { command, parameters } = req.body;
        const videoController = req.app.get('videoController');

        if (!videoController) {
            return res.status(500).json({
                success: false,
                message: '视频流服务未初始化'
            });
        }

        // 广播控制命令给所有推流者
        videoController.broadcastToStreamers({
            type: 'camera_control',
            command: command,
            parameters: parameters || {},
            fromAPI: true
        });

        res.json({
            success: true,
            message: '控制命令已发送'
        });
    } catch (error) {
        console.error('发送控制命令失败:', error);
        res.status(500).json({
            success: false,
            message: '发送命令失败'
        });
    }
});

// 静态文件服务 - 用于提供摄像头模拟器页面
app.use('/camera-simulator', express.static(path.join(__dirname, '../')));

// 根路径返回信息
app.get('/', (req, res) => {
    res.json({
        message: '视频流服务器运行中',
        endpoints: {
            status: '/api/video/status',
            control: '/api/video/control',
            websocket: '/video-stream',
            simulator: '/camera-simulator/camera_streamer.html'
        }
    });
});

// 初始化WebSocket服务器
videoStreamController.initializeWebSocketServer(server);

// 启动服务器
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', (error) => {
    if (error) {
        console.error('服务器启动失败:', error);
        process.exit(1);
    }
    console.log(`\n=== 视频流服务器已启动 ===`);
    console.log(`端口: ${PORT}`);
    console.log(`状态API: http://localhost:${PORT}/api/video/status`);
    console.log(`控制API: http://localhost:${PORT}/api/video/control`);
    console.log(`摄像头推流器: http://localhost:${PORT}/camera-simulator/camera_streamer.html`);
    console.log(`WebSocket: ws://localhost:${PORT}/video-stream`);
    console.log(`========================\n`);
});

server.on('error', (error) => {
    console.error('服务器错误:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`端口 ${PORT} 已被占用，请选择其他端口或停止占用该端口的进程`);
    }
});
