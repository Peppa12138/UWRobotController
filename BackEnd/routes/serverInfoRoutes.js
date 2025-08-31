/**
 * 服务器信息路由
 * 提供服务器状态和网络信息的API端点
 */

const express = require('express');
const os = require('os');

const router = express.Router();

// 网络接口优先级
const INTERFACE_PRIORITY = {
    'Ethernet': 1,
    'WLAN': 2,
    'WiFi': 3,
    'Wireless': 4,
};

/**
 * 获取本机IP地址
 * @returns {string} 本机IP地址
 */
function getLocalIP() {
    const networkInterfaces = os.networkInterfaces();
    let bestIP = null;
    let bestPriority = Infinity;

    console.log('检测网络接口:');
    for (const [name, interfaces] of Object.entries(networkInterfaces)) {
        const ipv4Interfaces = interfaces.filter(iface => iface.family === 'IPv4' && !iface.internal);
        if (ipv4Interfaces.length > 0) {
            console.log(`${name}:`, ipv4Interfaces.map(iface => iface.address));
        }
    }

    for (const [name, interfaces] of Object.entries(networkInterfaces)) {
        for (const iface of interfaces) {
            if (iface.family === 'IPv4' && !iface.internal) {
                // 计算接口优先级
                let priority = Infinity;
                for (const [keyword, keywordPriority] of Object.entries(INTERFACE_PRIORITY)) {
                    if (name.toLowerCase().includes(keyword.toLowerCase())) {
                        priority = Math.min(priority, keywordPriority);
                    }
                }

                console.log(`接口 ${name} (${iface.address}) 优先级: ${priority}`);

                if (priority < bestPriority) {
                    bestPriority = priority;
                    bestIP = iface.address;
                }
            }
        }
    }

    const finalIP = bestIP || '127.0.0.1';
    console.log(`选择的IP地址: ${finalIP}`);
    return finalIP;
}

/**
 * GET /api/server-info
 * 返回服务器基本信息，包括IP地址
 */
router.get('/server-info', (req, res) => {
    try {
        const serverIP = getLocalIP();
        const serverInfo = {
            serverIP: serverIP,
            port: process.env.PORT || 5000,
            timestamp: new Date().toISOString(),
            status: 'running',
            websocketURL: `ws://${serverIP}:${process.env.PORT || 5000}/video-stream`,
            apiBaseURL: `http://${serverIP}:${process.env.PORT || 5000}/api`,
        };

        console.log('[ServerInfo] 客户端请求服务器信息:', serverInfo);

        res.json({
            success: true,
            data: serverInfo,
        });
    } catch (error) {
        console.error('[ServerInfo] 获取服务器信息失败:', error);

        res.status(500).json({
            success: false,
            error: '获取服务器信息失败',
            details: error.message,
        });
    }
});

/**
 * GET /api/network-status
 * 返回网络连接状态
 */
router.get('/network-status', (req, res) => {
    try {
        const serverIP = getLocalIP();

        res.json({
            success: true,
            data: {
                serverIP: serverIP,
                connected: true,
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('[ServerInfo] 获取网络状态失败:', error);

        res.status(500).json({
            success: false,
            error: '获取网络状态失败',
        });
    }
});

module.exports = router;
