const WebSocket = require('ws');

/**
 * 视频流控制器
 * 处理摄像头视频流的传输和管理
 */
class VideoStreamController {
    constructor() {
        this.clients = new Map(); // 存储连接的客户端
        this.cameraStream = null; // 当前摄像头流
        this.isStreaming = false; // 流状态
        this.frameInterval = null; // 帧发送间隔
    }

    /**
     * 初始化WebSocket服务器
     * @param {Object} server - HTTP服务器实例
     */
    initializeWebSocketServer(server) {
        this.wss = new WebSocket.Server({ server, path: '/video-stream' });

        this.wss.on('connection', (ws, req) => {
            const clientId = this.generateClientId();
            console.log(`新的视频流客户端连接: ${clientId}`);

            // 存储客户端信息
            this.clients.set(clientId, {
                ws,
                isActive: true,
                joinTime: new Date(),
                clientType: 'viewer', // viewer: 观看者, streamer: 推流者
            });

            // 处理客户端消息
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleClientMessage(clientId, data);
                } catch (error) {
                    console.error('解析客户端消息失败:', error);
                }
            });

            // 处理客户端断开连接
            ws.on('close', () => {
                console.log(`客户端断开连接: ${clientId}`);
                this.clients.delete(clientId);
            });

            // 发送欢迎消息
            this.sendToClient(clientId, {
                type: 'welcome',
                clientId: clientId,
                message: '成功连接到视频流服务器',
            });
        });

        console.log('视频流WebSocket服务器已启动');
    }

    /**
     * 处理客户端消息
     * @param {string} clientId - 客户端ID
     * @param {Object} data - 消息数据
     */
    handleClientMessage(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client) {
            return;
        }

        switch (data.type) {
            case 'start_stream':
                this.handleStartStream(clientId, data);
                break;
            case 'stop_stream':
                this.handleStopStream(clientId);
                break;
            case 'video_frame':
                this.handleVideoFrame(clientId, data);
                break;
            case 'join_as_viewer':
                this.handleJoinAsViewer(clientId);
                break;
            case 'camera_control':
                this.handleCameraControl(clientId, data);
                break;
            default:
                console.log(`未知消息类型: ${data.type}`);
        }
    }

    /**
     * 开始视频流
     * @param {string} clientId - 客户端ID
     * @param {Object} data - 流数据
     */
    handleStartStream(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client) {
            return;
        }

        client.clientType = 'streamer';
        this.isStreaming = true;

        console.log(`客户端 ${clientId} 开始推流`);

        // 通知所有观看者有新的流开始
        this.broadcastToViewers({
            type: 'stream_started',
            streamerId: clientId,
            streamInfo: {
                resolution: data.resolution || '1920x1080',
                fps: data.fps || 30,
                codec: data.codec || 'H264',
            },
        });

        // 响应推流者
        this.sendToClient(clientId, {
            type: 'stream_start_ack',
            success: true,
            message: '视频流已开始',
        });
    }

    /**
     * 停止视频流
     * @param {string} clientId - 客户端ID
     */
    handleStopStream(clientId) {
        const client = this.clients.get(clientId);
        if (!client || client.clientType !== 'streamer') {
            return;
        }

        this.isStreaming = false;

        console.log(`客户端 ${clientId} 停止推流`);

        // 通知所有观看者流已停止
        this.broadcastToViewers({
            type: 'stream_stopped',
            streamerId: clientId,
        });

        // 响应推流者
        this.sendToClient(clientId, {
            type: 'stream_stop_ack',
            success: true,
            message: '视频流已停止',
        });
    }

    /**
     * 处理视频帧数据
     * @param {string} clientId - 客户端ID
     * @param {Object} data - 帧数据
     */
    handleVideoFrame(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client || client.clientType !== 'streamer') {
            console.log(`视频帧被拒绝: clientId=${clientId}, clientType=${client?.clientType}`);
            return;
        }

        // console.log(`收到视频帧: clientId=${clientId}, frameNumber=${data.frameNumber}, frameDataLength=${data.frameData?.length}`);

        // 转发视频帧给所有观看者
        this.broadcastToViewers({
            type: 'video_frame',
            streamerId: clientId,
            frameData: data.frameData,
            timestamp: data.timestamp || Date.now(),
            frameNumber: data.frameNumber || 0,
        });
    }

    /**
     * 处理观看者加入
     * @param {string} clientId - 客户端ID
     */
    handleJoinAsViewer(clientId) {
        const client = this.clients.get(clientId);
        if (!client) {
            return;
        }

        client.clientType = 'viewer';

        // console.log(`客户端 ${clientId} 加入为观看者`);

        // 发送当前流状态
        this.sendToClient(clientId, {
            type: 'viewer_joined',
            isStreaming: this.isStreaming,
            viewerCount: this.getViewerCount(),
        });
    }

    /**
     * 处理摄像头控制命令
     * @param {string} clientId - 客户端ID
     * @param {Object} data - 控制数据
     */
    handleCameraControl(clientId, data) {
        console.log(`收到摄像头控制命令: ${data.command} from ${clientId}`);

        // 转发控制命令给推流者
        this.broadcastToStreamers({
            type: 'camera_control',
            command: data.command,
            parameters: data.parameters,
            fromViewer: clientId,
        });
    }

    /**
     * 向指定客户端发送消息
     * @param {string} clientId - 客户端ID
     * @param {Object} data - 消息数据
     */
    sendToClient(clientId, data) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(data));
        }
    }

    /**
     * 向所有观看者广播消息
     * @param {Object} data - 消息数据
     */
    broadcastToViewers(data) {
        const viewers = Array.from(this.clients.values()).filter(client => client.clientType === 'viewer');
        // console.log(`广播消息给 ${viewers.length} 个观看者, 消息类型: ${data.type}`);

        this.clients.forEach((client, clientId) => {
            if (client.clientType === 'viewer' && client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify(data));
            }
        });
    }

    /**
     * 向所有推流者广播消息
     * @param {Object} data - 消息数据
     */
    broadcastToStreamers(data) {
        this.clients.forEach((client, clientId) => {
            if (client.clientType === 'streamer' && client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify(data));
            }
        });
    }

    /**
     * 获取观看者数量
     * @returns {number} 观看者数量
     */
    getViewerCount() {
        return Array.from(this.clients.values()).filter(client => client.clientType === 'viewer').length;
    }

    /**
     * 生成客户端ID
     * @returns {string} 客户端ID
     */
    generateClientId() {
        return 'client_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    /**
     * 获取流状态信息
     * @returns {Object} 流状态
     */
    getStreamStatus() {
        return {
            isStreaming: this.isStreaming,
            totalClients: this.clients.size,
            viewerCount: this.getViewerCount(),
            streamerCount: Array.from(this.clients.values()).filter(client => client.clientType === 'streamer').length,
        };
    }
}

module.exports = VideoStreamController;
