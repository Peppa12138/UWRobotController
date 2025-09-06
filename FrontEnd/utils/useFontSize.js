import { useState, useEffect } from 'react';
import fontSizeManager from './FontSizeManager';

/**
 * 自定义Hook：使用全局字体大小
 * @returns {number} 当前字体大小
 */
export const useFontSize = () => {
  const [fontSize, setFontSize] = useState(fontSizeManager.getCurrentFontSize());

  useEffect(() => {
    // 加载初始字体大小
    fontSizeManager.loadFontSize().then(size => {
      setFontSize(size);
    });

    // 监听字体大小变化
    const removeListener = fontSizeManager.addListener((newSize) => {
      setFontSize(newSize);
    });

    return removeListener; // 清理监听器
  }, []);

  return fontSize;
};

/**
 * 获取相对字体大小的Hook
 * @param {number} baseSize - 基础字体大小
 * @returns {number} 调整后的字体大小
 */
export const useRelativeFontSize = (baseSize) => {
  const fontSize = useFontSize();
  const ratio = fontSize / 16; // 以16为基准
  return Math.round(baseSize * ratio);
};
