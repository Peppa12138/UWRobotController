/**
 * IP地址检测测试脚本
 * 用于测试动态IP获取功能
 */

const { getLocalIP, showAllNetworkInterfaces, initializeNetworkConfig } = require('./FrontEnd/config/NetworkConfig');

console.log('=== IP地址检测测试 ===\n');

// 显示所有网络接口
console.log('1. 显示所有网络接口:');
showAllNetworkInterfaces();

console.log('\n2. 当前检测到的IP地址:');
const ip = getLocalIP();
console.log(`IP: ${ip}`);

console.log('\n3. 完整网络配置初始化:');
initializeNetworkConfig();

console.log('测试完成！');
