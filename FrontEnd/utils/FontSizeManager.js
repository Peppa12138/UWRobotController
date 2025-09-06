import AsyncStorage from '@react-native-async-storage/async-storage';

class FontSizeManager {
  constructor() {
    this.currentFontSize = 16;
    this.listeners = [];
  }

  // 获取当前字体大小
  getCurrentFontSize() {
    return this.currentFontSize;
  }

  // 设置字体大小并通知所有监听器
  async setFontSize(size) {
    this.currentFontSize = size;
    
    // 保存到存储
    try {
      await AsyncStorage.setItem('appFontSize', size.toString());
    } catch (error) {
      console.error('保存字体大小失败:', error);
    }

    // 通知所有监听器
    this.listeners.forEach(listener => listener(size));
  }

  // 从存储中加载字体大小
  async loadFontSize() {
    try {
      const savedFontSize = await AsyncStorage.getItem('appFontSize');
      if (savedFontSize !== null) {
        this.currentFontSize = parseFloat(savedFontSize);
        // 通知所有监听器
        this.listeners.forEach(listener => listener(this.currentFontSize));
      }
    } catch (error) {
      console.error('加载字体大小失败:', error);
    }
    return this.currentFontSize;
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

  // 获取基于基础字体大小的相对大小
  getRelativeSize(baseSize) {
    const ratio = this.currentFontSize / 16; // 以16为基准
    return Math.round(baseSize * ratio);
  }
}

// 导出单例
const fontSizeManager = new FontSizeManager();
export default fontSizeManager;
