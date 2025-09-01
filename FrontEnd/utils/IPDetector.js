/**
 * React Native IP检测工具
 * 用于在移动应用中动态获取服务器IP地址
 */

import { Platform } from 'react-native';

export class IPDetector {
    static currentIP = null;
    static listeners = [];

    /**
     * 获取当前服务器IP地址 (React Native版本)
     */
    static getCurrentIP() {
        if (!this.currentIP) {
            // React Native环境中，我们需要手动配置或从远程获取
            // 这里先使用一个默认配置，实际项目中可以从配置文件读取
            if (Platform.OS === 'android') {
                // Android真机或模拟器
                this.currentIP = '172.6.1.44'; // 从后端动态检测到的IP
            } else if (Platform.OS === 'ios') {
                // iOS设备
                this.currentIP = '172.6.1.44'; // 从后端动态检测到的IP
            } else {
                // 其他平台
                this.currentIP = '192.168.1.100';
            }
        }
        return this.currentIP;
    }

    /**
     * 手动设置IP地址（当从后端获取到真实IP时）
     */
    static setIP(newIP) {
        const oldIP = this.currentIP;
        this.currentIP = newIP;

        if (oldIP !== newIP) {
            console.log(`[IPDetector] IP地址已更新: ${oldIP} -> ${newIP}`);

            // 通知所有监听器
            this.listeners.forEach(callback => {
                try {
                    callback(newIP, oldIP);
                } catch (error) {
                    console.error('[IPDetector] 监听器回调错误:', error);
                }
            });
        }
    }

    /**
     * 获取WebSocket连接URL
     */
    static getWebSocketURL() {
        const ip = this.getCurrentIP();
        return `ws://${ip}:5000/video-stream`;
    }

    /**
     * 获取API基础URL
     */
    static getAPIBaseURL() {
        const ip = this.getCurrentIP();
        return `http://${ip}:5000/api`;
    }

    /**
     * 获取完整的应用配置（基于动态IP）
     */
    static getConfigForEnvironment(environment = 'DEVELOPMENT') {
        const ip = this.getCurrentIP();

        return {
            WEBSOCKET_URL: `ws://${ip}:5000/video-stream`,
            API_BASE_URL: `http://${ip}:5000/api`,
            SERVER_IP: ip,
            SERVER_PORT: 5000,
        };
    }

    /**
     * 添加IP变化监听器
     */
    static addIPChangeListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * 移除IP变化监听器
     */
    static removeIPChangeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    /**
     * 手动刷新IP地址（当网络环境改变时）
     */
    static refreshIP() {
        // 在React Native中，我们可能需要调用原生模块或API来检测IP
        // 现在简化为手动设置
        return this.currentIP;
    }

    /**
     * 输出当前网络配置信息
     */
    static logNetworkInfo() {
        const config = this.getConfigForEnvironment();
        console.log('\n=== React Native 网络配置 ===');
        console.log('平台:', Platform.OS);
        console.log('服务器IP:', config.SERVER_IP);
        console.log('WebSocket URL:', config.WEBSOCKET_URL);
        console.log('API Base URL:', config.API_BASE_URL);
        console.log('==============================\n');
    }

    /**
     * 从服务器获取真实IP地址
     */
    static async fetchServerIP() {
        try {
            // 尝试连接到一个已知的端点来获取服务器IP
            // 这个功能需要服务器提供一个返回其IP的API端点
            const possibleIPs = [
                '172.6.1.44',  // 当前检测到的IP
                '192.168.56.1', // 之前的IP
                '192.168.1.100', // 默认备选
            ];

            for (const ip of possibleIPs) {
                try {
                    const response = await fetch(`http://${ip}:5000/api/server-info`, {
                        method: 'GET',
                        timeout: 3000,
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.serverIP) {
                            this.setIP(data.serverIP);
                            return data.serverIP;
                        }
                    }
                } catch (error) {
                    console.log(`[IPDetector] 尝试连接 ${ip} 失败:`, error.message);
                }
            }

            // 如果都失败了，使用第一个IP作为默认值
            this.setIP(possibleIPs[0]);
            return possibleIPs[0];

        } catch (error) {
            console.error('[IPDetector] 获取服务器IP失败:', error);
            return this.getCurrentIP();
        }
    }
}

// 默认导出
export default IPDetector;