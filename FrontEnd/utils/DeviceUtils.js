import { Dimensions, PixelRatio } from 'react-native';

// 获取设备信息和响应式计算工具
export class DeviceUtils {
  static getDimensions() {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  }

  // 判断设备类型
  static getDeviceType() {
    const { width, height } = this.getDimensions();
    const minDimension = Math.min(width, height);
    const maxDimension = Math.max(width, height);
    
    if (minDimension >= 768) {
      return 'tablet';
    } else if (minDimension >= 414) {
      return 'large-phone';
    } else if (minDimension >= 375) {
      return 'medium-phone';
    } else {
      return 'small-phone';
    }
  }

  // 判断屏幕方向
  static getOrientation() {
    const { width, height } = this.getDimensions();
    return width > height ? 'landscape' : 'portrait';
  }

  // 响应式尺寸计算
  static getResponsiveSize(baseSize, factor = 1) {
    const { width } = this.getDimensions();
    const deviceType = this.getDeviceType();
    
    const scaleFactor = {
      'tablet': 1.4,
      'large-phone': 1.2,
      'medium-phone': 1.0,
      'small-phone': 0.8
    };
    
    return baseSize * (scaleFactor[deviceType] || 1) * factor;
  }

  // 获取安全边距
  static getSafeMargins() {
    const { width, height } = this.getDimensions();
    const deviceType = this.getDeviceType();
    const isLandscape = this.getOrientation() === 'landscape';
    
    return {
      horizontal: width * (isLandscape ? 0.05 : 0.08),
      vertical: height * (isLandscape ? 0.08 : 0.05),
      bottom: height * (deviceType === 'small-phone' ? 0.08 : 0.05)
    };
  }

  // 获取触摸区域最小尺寸
  static getMinTouchSize() {
    const deviceType = this.getDeviceType();
    return {
      'tablet': 60,
      'large-phone': 50,
      'medium-phone': 44,
      'small-phone': 40
    }[deviceType] || 44;
  }

  // 获取字体缩放因子
  static getFontScale() {
    const deviceType = this.getDeviceType();
    const pixelRatio = PixelRatio.get();
    
    const baseFontScale = {
      'tablet': 1.3,
      'large-phone': 1.1,
      'medium-phone': 1.0,
      'small-phone': 0.9
    }[deviceType] || 1.0;

    // 考虑像素密度
    return baseFontScale * Math.min(pixelRatio / 2, 1.2);
  }

  // 虚拟摇杆适配参数
  static getJoystickConfig() {
    const deviceType = this.getDeviceType();
    const { width } = this.getDimensions();
    
    const configs = {
      'tablet': {
        radius: Math.min(width * 0.08, 90),
        minStickRadius: 16,
        maxStickRadius: 32,
        directionButtonSize: 36
      },
      'large-phone': {
        radius: Math.min(width * 0.09, 80),
        minStickRadius: 14,
        maxStickRadius: 28,
        directionButtonSize: 32
      },
      'medium-phone': {
        radius: Math.min(width * 0.1, 70),
        minStickRadius: 12,
        maxStickRadius: 25,
        directionButtonSize: 28
      },
      'small-phone': {
        radius: Math.min(width * 0.11, 60),
        minStickRadius: 10,
        maxStickRadius: 22,
        directionButtonSize: 24
      }
    };
    
    return configs[deviceType] || configs['medium-phone'];
  }

  // 布局位置适配
  static getLayoutPositions() {
    const { width, height } = this.getDimensions();
    const orientation = this.getOrientation();
    const deviceType = this.getDeviceType();
    const margins = this.getSafeMargins();
    
    if (orientation === 'landscape') {
      return {
        leftPanel: {
          bottom: margins.vertical,
          left: margins.horizontal * 0.5
        },
        rightPanel: {
          bottom: margins.vertical,
          right: margins.horizontal * 0.5
        },
        statusView: {
          top: margins.vertical * 0.5,
          left: margins.horizontal * 0.3
        }
      };
    } else {
      return {
        leftPanel: {
          bottom: margins.bottom,
          left: margins.horizontal
        },
        rightPanel: {
          bottom: margins.bottom,
          right: margins.horizontal
        },
        statusView: {
          top: height * 0.11,
          left: width * 0.01
        }
      };
    }
  }
}

export default DeviceUtils;
