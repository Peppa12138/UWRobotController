/**
 * 视频流网络配置文件
 * 根据部署环境调整这些设置
 */

// 获取本机IP地址的函数
const getLocalIP = () => {
    // 这里返回检测到的本机IP地址
    // 在实际部署时，可以动态获取
    return '192.168.56.1';
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

module.exports = {
    NetworkConfig,
    getAppConfig,
};
