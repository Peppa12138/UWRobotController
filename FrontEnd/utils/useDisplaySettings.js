import { useState, useEffect } from 'react';
import displaySettingsManager from './DisplaySettingsManager';

/**
 * 自定义Hook：使用显示设置
 * @returns {object} 当前显示设置对象
 */
export const useDisplaySettings = () => {
  const [displaySettings, setDisplaySettings] = useState(
    displaySettingsManager.getCurrentSettings()
  );

  useEffect(() => {
    // 加载初始显示设置
    displaySettingsManager.loadDisplaySettings().then(settings => {
      setDisplaySettings(settings);
    });

    // 监听显示设置变化
    const removeListener = displaySettingsManager.addListener((newSettings) => {
      setDisplaySettings(newSettings);
    });

    return removeListener; // 清理监听器
  }, []);

  return displaySettings;
};

/**
 * 检查组件是否应该显示的Hook
 * @param {string} componentKey - 组件键名
 * @returns {boolean} 是否应该显示
 */
export const useShouldShow = (componentKey) => {
  const displaySettings = useDisplaySettings();
  return displaySettings[componentKey] || false;
};
