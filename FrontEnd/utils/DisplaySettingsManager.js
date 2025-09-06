import AsyncStorage from '@react-native-async-storage/async-storage';

class DisplaySettingsManager {
  constructor() {
    this.currentSettings = {
      networkStatus: true,    // 网络状态
      videoStats: true,      // 视频统计
      statusView: true,      // 设备状态
      virtualJoystick: true, // 虚拟摇杆
    };
    this.listeners = [];
  }

  // 获取当前显示设置
  getCurrentSettings() {
    return this.currentSettings;
  }

  // 设置显示配置并通知所有监听器
  async setDisplaySettings(settings) {
    this.currentSettings = { ...this.currentSettings, ...settings };
    
    // 保存到存储
    try {
      await AsyncStorage.setItem('displaySettings', JSON.stringify(this.currentSettings));
    } catch (error) {
      console.error('保存显示设置失败:', error);
    }

    // 通知所有监听器
    this.listeners.forEach(listener => listener(this.currentSettings));
  }

  // 从存储中加载显示设置
  async loadDisplaySettings() {
    try {
      const savedSettings = await AsyncStorage.getItem('displaySettings');
      if (savedSettings !== null) {
        this.currentSettings = { ...this.currentSettings, ...JSON.parse(savedSettings) };
        // 通知所有监听器
        this.listeners.forEach(listener => listener(this.currentSettings));
      }
    } catch (error) {
      console.error('加载显示设置失败:', error);
    }
    return this.currentSettings;
  }

  // 添加监听器
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // 移除监听器
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // 检查某个组件是否应该显示
  shouldShow(componentKey) {
    return this.currentSettings[componentKey] || false;
  }

  // 切换某个组件的显示状态
  async toggleComponent(componentKey) {
    const newSettings = {
      ...this.currentSettings,
      [componentKey]: !this.currentSettings[componentKey]
    };
    await this.setDisplaySettings(newSettings);
  }
}

// 导出单例
const displaySettingsManager = new DisplaySettingsManager();
export default displaySettingsManager;
