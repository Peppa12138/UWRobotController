/**
 * React Native IP检测工具
 * 简化版本 - 主要作为Config.js的快捷访问接口
 */

import { Platform } from 'react-native';
import Config from '../config/Config';

export class IPDetector {
    static currentIP = null;

    /**
     * 获取当前服务器IP地址
     */
    static getCurrentIP() {
        if (!this.currentIP) {
            this.currentIP = Config.getServerIP();
        }
        return this.currentIP;
    }

    /**
     * 手动设置IP地址
     */
    static setIP(newIP) {
        this.currentIP = newIP;
        console.log(`[IPDetector] IP地址已更新: ${newIP}`);
    }

  /**
   * 获取WebSocket连接URL
   */
  static getWebSocketURL() {
    return Config.getWebSocketURL();
  }

  /**
   * 获取API基础URL
   */
  static getAPIBaseURL() {
    return Config.getAPIBaseURL();
  }

  /**
   * 尝试连接到服务器，自动检测可用的IP地址
   * 提高不同模拟器的兼容性
   */
  static async findWorkingServerIP() {
    const possibleIPs = Config.getAllPossibleIPs();
    
    console.log('[IPDetector] 开始自动检测服务器IP地址...');
    
    for (const ip of possibleIPs) {
      try {
        console.log(`[IPDetector] 尝试连接: ${ip}:${Config.SERVER_PORT}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`http://${ip}:${Config.SERVER_PORT}/api/server-info`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`[IPDetector] ✅ 成功连接到: ${ip}`);
          this.setIP(ip);
          return ip;
        }
      } catch (error) {
        console.log(`[IPDetector] ❌ ${ip} 连接失败:`, error.message);
      }
    }
    
    console.log(`[IPDetector] ⚠️ 所有IP都无法连接，使用默认配置`);
    return this.getCurrentIP();
  }    /**
     * 获取完整的应用配置
     */
    static getConfigForEnvironment() {
        return {
            WEBSOCKET_URL: Config.getWebSocketURL(),
            API_BASE_URL: Config.getAPIBaseURL(),
            SERVER_IP: Config.getServerIP(),
            SERVER_PORT: Config.SERVER_PORT,
        };
    }

    /**
     * 输出当前网络配置信息
     */
    static logNetworkInfo() {
        const config = this.getConfigForEnvironment();
        console.log('\n=== React Native 网络配置 ===');
        console.log('平台:', Platform.OS);
        console.log('环境:', Config.ENVIRONMENT);
        console.log('服务器IP:', config.SERVER_IP);
        console.log('WebSocket URL:', config.WEBSOCKET_URL);
        console.log('API Base URL:', config.API_BASE_URL);
        console.log('==============================\n');
    }
}

export default IPDetector;



