/**
 * 视频流网络配置文件
 * 根据部署环境调整这些设置
 */

const os = require('os');

// 动态获取本机IP地址的函数
const getLocalIP = () => {
    try {
        const networkInterfaces = os.networkInterfaces();

        // 优先级列表：以太网 > Wi-Fi > 其他
        const priorityInterfaces = ['以太网', 'Ethernet', 'Wi-Fi', 'WLAN', 'en0', 'eth0'];

        // 首先尝试按优先级查找
        for (const interfaceName of priorityInterfaces) {
            const interfaces = networkInterfaces[interfaceName];
            if (interfaces) {
                for (const iface of interfaces) {
                    // IPv4、非内部网络、非回环地址
                    if (iface.family === 'IPv4' && !iface.internal && iface.address !== '127.0.0.1') {
                        console.log(`[NetworkConfig] 找到首选IP地址: ${iface.address} (接口: ${interfaceName})`);
                        return iface.address;
                    }
                }
            }
        }

        // 如果优先级接口没找到，遍历所有接口
        for (const interfaceName in networkInterfaces) {
            const interfaces = networkInterfaces[interfaceName];
            for (const iface of interfaces) {
                // IPv4、非内部网络、非回环地址
                if (iface.family === 'IPv4' && !iface.internal && iface.address !== '127.0.0.1') {
                    console.log(`[NetworkConfig] 找到备用IP地址: ${iface.address} (接口: ${interfaceName})`);
                    return iface.address;
                }
            }
        }

        // 如果都没找到，返回默认值
        console.warn('[NetworkConfig] 未找到有效的网络接口，使用默认IP');
        return '192.168.1.100';

    } catch (error) {
        console.error('[NetworkConfig] 获取IP地址时出错:', error);
        return '192.168.1.100'; // 默认值
    }
};

// 显示所有可用的网络接口（调试用）
const showAllNetworkInterfaces = () => {
    try {
        const networkInterfaces = os.networkInterfaces();
        console.log('[NetworkConfig] 所有网络接口:');

        for (const interfaceName in networkInterfaces) {
            const interfaces = networkInterfaces[interfaceName];
            console.log(`\n接口名称: ${interfaceName}`);

            interfaces.forEach((iface, index) => {
                console.log(`  [${index}] ${iface.family} - ${iface.address} ${iface.internal ? '(内部)' : '(外部)'}`);
            });
        }
    } catch (error) {
        console.error('[NetworkConfig] 显示网络接口时出错:', error);
    }
};

const NetworkConfig = {
    // 服务器配置
    SERVER: {
        PORT: 5000,
        HOST: '0.0.0.0', // 监听所有网络接口
        IP: getLocalIP(),
    },

    // APP连接配置
    APP: {
        // 开发环境 - 使用实际IP
        DEVELOPMENT: {
            WEBSOCKET_URL: `ws://${getLocalIP()}:5000/video-stream`,
            API_BASE_URL: `http://${getLocalIP()}:5000/api`,
        },

        // Android模拟器环境
        EMULATOR: {
            WEBSOCKET_URL: 'ws://10.0.2.2:5000/video-stream',
            API_BASE_URL: 'http://10.0.2.2:5000/api',
        },

        // 真机测试环境
        DEVICE: {
            WEBSOCKET_URL: `ws://${getLocalIP()}:5000/video-stream`,
            API_BASE_URL: `http://${getLocalIP()}:5000/api`,
        },
    },

    // 推流器配置
    STREAMER: {
        WEBSOCKET_URL: 'ws://localhost:5000/video-stream', // 推流器在同一台电脑上
    },
};

// 根据环境选择配置
const getAppConfig = (environment = 'DEVELOPMENT') => {
    return NetworkConfig.APP[environment];
};

// 初始化时显示网络信息
const initializeNetworkConfig = () => {
    const currentIP = getLocalIP();
    console.log('\n=== 网络配置初始化 ===');
    console.log(`当前检测到的IP地址: ${currentIP}`);
    console.log(`WebSocket地址: ws://${currentIP}:5000/video-stream`);
    console.log(`API地址: http://${currentIP}:5000/api`);
    console.log('========================\n');

    // 如果需要查看所有网络接口，取消下面的注释
    // showAllNetworkInterfaces();

    return currentIP;
};

module.exports = {
    NetworkConfig,
    getAppConfig,
    getLocalIP,
    showAllNetworkInterfaces,
    initializeNetworkConfig,
};
