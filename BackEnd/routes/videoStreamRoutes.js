const express = require('express');
const VideoStreamController = require('../controllers/videoStreamController');

const router = express.Router();

/**
 * 获取视频流状态
 */
// router.get('/status', (req, res) => {
//     try {
//         const status = videoStreamController.getStreamStatus();
//         res.json({
//             success: true,
//             data: status,
//         });
//     } catch (error) {
//         console.error('获取视频流状态失败:', error);
//         res.status(500).json({
//             success: false,
//             message: '获取视频流状态失败',
//             error: error.message,
//         });
//     }
// });
router.get('/status', (req, res) => {
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

router.post('/control', (req, res) => {
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
/**
 * 控制摄像头命令（REST API接口）
 */
// router.post('/camera/control', (req, res) => {
//     try {
//         const { command, parameters } = req.body;

//         if (!command) {
//             return res.status(400).json({
//                 success: false,
//                 message: '缺少控制命令',
//             });
//         }

//         // 向所有推流者发送控制命令
//         videoStreamController.broadcastToStreamers({
//             type: 'camera_control',
//             command: command,
//             parameters: parameters || {},
//             fromViewer: 'api_client',
//         });

//         res.json({
//             success: true,
//             message: '摄像头控制命令已发送',
//             command: command,
//         });
//     } catch (error) {
//         console.error('摄像头控制失败:', error);
//         res.status(500).json({
//             success: false,
//             message: '摄像头控制失败',
//             error: error.message,
//         });
//     }
// });

/**
 * 获取连接的客户端列表
 */
router.get('/clients', (req, res) => {
    try {
        const videoController = req.app.get('videoController');
        if (!videoController) {
            return res.status(500).json({
                success: false,
                message: '视频流服务未初始化'
            });
        }

        const clients = [];
        videoController.clients.forEach((client, clientId) => {
            clients.push({
                id: clientId,
                type: client.clientType,
                joinTime: client.joinTime,
                isActive: client.isActive,
            });
        });

        res.json({
            success: true,
            data: {
                totalClients: clients.length,
                clients: clients,
            },
        });
    } catch (error) {
        console.error('获取客户端列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取客户端列表失败',
            error: error.message,
        });
    }
});

module.exports = router;
