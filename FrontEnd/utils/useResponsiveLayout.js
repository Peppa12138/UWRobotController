import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import DeviceUtils from './DeviceUtils';

export const useResponsiveLayout = () => {
  const [screenData, setScreenData] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return {
      width,
      height,
      deviceType: DeviceUtils.getDeviceType(),
      orientation: DeviceUtils.getOrientation(),
      safeMargins: DeviceUtils.getSafeMargins(),
      joystickConfig: DeviceUtils.getJoystickConfig(),
      layoutPositions: DeviceUtils.getLayoutPositions(),
      minTouchSize: DeviceUtils.getMinTouchSize(),
      fontScale: DeviceUtils.getFontScale()
    };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData({
        width: window.width,
        height: window.height,
        deviceType: DeviceUtils.getDeviceType(),
        orientation: DeviceUtils.getOrientation(),
        safeMargins: DeviceUtils.getSafeMargins(),
        joystickConfig: DeviceUtils.getJoystickConfig(),
        layoutPositions: DeviceUtils.getLayoutPositions(),
        minTouchSize: DeviceUtils.getMinTouchSize(),
        fontScale: DeviceUtils.getFontScale()
      });
    });

    return () => subscription?.remove();
  }, []);

  return screenData;
};

export default useResponsiveLayout;
