import React, {useEffect, useRef} from 'react';
import {DeviceEventEmitter} from 'react-native';
import gameSirManager from '../GamepadManager/GamepadManager';

const VirtualJoystickSync = ({
  onLeftStickChange,
  onRightStickChange,
  gamepadEnabled = false,
  maxRadius = 50, // 虚拟摇杆的最大半径（像素）
}) => {
  const leftStickRef = useRef({x: 0, y: 0});
  const rightStickRef = useRef({x: 0, y: 0});

  useEffect(() => {
    if (!gamepadEnabled) {
      return;
    }

    console.log('启用GameSir X2s摇杆同步功能');
    
    // 初始化GameSir手柄管理器
    gameSirManager.init();

    // 监听手柄事件
    const gamepadListener = DeviceEventEmitter.addListener('gamepadEvent', (event) => {
      const {type, data} = event;
      
      switch (type) {
        case 'leftStick':
          handleLeftStickChange(data);
          break;
        case 'rightStick':
          handleRightStickChange(data);
          break;
        case 'button':
          handleButtonPress(data);
          break;
        case 'connected':
          console.log('GameSir X2s手柄已连接，摇杆同步已激活');
          break;
        case 'disconnected':
          console.log('GameSir X2s手柄已断开，摇杆同步已停用');
          // 重置摇杆位置
          resetJoysticks();
          break;
      }
    });

    return () => {
      gamepadListener.remove();
      console.log('摇杆同步监听器已移除');
    };
  }, [gamepadEnabled]);

  // 处理左摇杆变化（主要用于控制移动）
  const handleLeftStickChange = (stickData) => {
    const {x, y} = stickData;
    leftStickRef.current = {x, y};
    
    // 转换坐标系统：
    // GameSir X2s: x∈[-1,1], y∈[-1,1] （y轴向上为正）
    // 虚拟摇杆: 通常以像素为单位，y轴向下为正
    const virtualJoystickData = {
      // 直接映射X轴：左(-1) → 左(-maxRadius), 右(1) → 右(maxRadius)
      x: x * maxRadius,
      
      // Y轴需要反转：上(-1) → 上(-maxRadius), 下(1) → 下(maxRadius)
      // 因为GameSir的Y轴向上为负，虚拟摇杆Y轴向下为正
      y: -y * maxRadius,
      
      // 计算角度和距离
      angle: Math.atan2(-y, x), // 反转Y轴计算角度
      distance: Math.min(Math.sqrt(x * x + y * y), 1) * maxRadius,
      
      // 原始手柄数据
      raw: {x, y}
    };

    // 调试输出
    console.log(`左摇杆同步: 手柄(${x.toFixed(2)}, ${y.toFixed(2)}) → 虚拟(${virtualJoystickData.x.toFixed(1)}, ${virtualJoystickData.y.toFixed(1)})`);

    // 回调给父组件
    if (onLeftStickChange) {
      onLeftStickChange(virtualJoystickData);
    }

    // 广播给其他组件
    DeviceEventEmitter.emit('virtualJoystickSync', {
      stick: 'left',
      data: virtualJoystickData,
      source: 'gamesir_x2s'
    });
  };

  // 处理右摇杆变化（可用于视角控制等）
  const handleRightStickChange = (stickData) => {
    const {x, y} = stickData;
    rightStickRef.current = {x, y};
    
    const virtualJoystickData = {
      x: x * maxRadius,
      y: -y * maxRadius, // 同样反转Y轴
      angle: Math.atan2(-y, x),
      distance: Math.min(Math.sqrt(x * x + y * y), 1) * maxRadius,
      raw: {x, y}
    };

    console.log(`右摇杆同步: 手柄(${x.toFixed(2)}, ${y.toFixed(2)}) → 虚拟(${virtualJoystickData.x.toFixed(1)}, ${virtualJoystickData.y.toFixed(1)})`);

    if (onRightStickChange) {
      onRightStickChange(virtualJoystickData);
    }

    DeviceEventEmitter.emit('virtualJoystickSync', {
      stick: 'right',
      data: virtualJoystickData,
      source: 'gamesir_x2s'
    });
  };

  // 处理按钮按下
  const handleButtonPress = (buttonData) => {
    const {index, name, pressed, value} = buttonData;
    
    console.log(`GameSir按钮 ${name} ${pressed ? '按下' : '释放'}, 值: ${value}`);
    
    // 广播按钮事件
    DeviceEventEmitter.emit('gamepadButton', {
      button: name,
      pressed,
      value,
      index,
      source: 'gamesir_x2s'
    });

    // 特殊按钮处理
    switch (name) {
      case 'A':
        if (pressed) {
          console.log('A键按下 - 可用于确认操作');
        }
        break;
      case 'B':
        if (pressed) {
          console.log('B键按下 - 可用于取消操作');
        }
        break;
      case 'X':
        if (pressed) {
          console.log('X键按下 - 可用于特殊功能');
        }
        break;
      case 'Y':
        if (pressed) {
          console.log('Y键按下 - 可用于特殊功能');
        }
        break;
      case 'Start':
        if (pressed) {
          console.log('Start键按下 - 可用于暂停/菜单');
        }
        break;
    }
  };

  // 重置摇杆位置
  const resetJoysticks = () => {
    const resetData = {
      x: 0,
      y: 0,
      angle: 0,
      distance: 0,
      raw: {x: 0, y: 0}
    };

    // 重置左摇杆
    if (onLeftStickChange) {
      onLeftStickChange(resetData);
    }
    DeviceEventEmitter.emit('virtualJoystickSync', {
      stick: 'left',
      data: resetData,
      source: 'reset'
    });

    // 重置右摇杆
    if (onRightStickChange) {
      onRightStickChange(resetData);
    }
    DeviceEventEmitter.emit('virtualJoystickSync', {
      stick: 'right', 
      data: resetData,
      source: 'reset'
    });

    console.log('虚拟摇杆已重置到中心位置');
  };

  // 获取当前摇杆状态
  const getCurrentState = () => {
    return {
      left: leftStickRef.current,
      right: rightStickRef.current,
      connected: gameSirManager.getConnectionStatus().connected
    };
  };

  // 这个组件不渲染任何UI，只处理数据同步
  return null;
};

// 导出一些有用的工具函数
export const GamepadUtils = {
  // 坐标转换：手柄坐标 → 虚拟摇杆坐标
  gamepadToVirtual: (gamepadX, gamepadY, maxRadius = 50) => {
    return {
      x: gamepadX * maxRadius,
      y: -gamepadY * maxRadius, // 反转Y轴
      distance: Math.sqrt(gamepadX * gamepadX + gamepadY * gamepadY) * maxRadius,
      angle: Math.atan2(-gamepadY, gamepadX)
    };
  },

  // 坐标转换：虚拟摇杆坐标 → 手柄坐标  
  virtualToGamepad: (virtualX, virtualY, maxRadius = 50) => {
    return {
      x: virtualX / maxRadius,
      y: -virtualY / maxRadius, // 反转Y轴
      distance: Math.sqrt(virtualX * virtualX + virtualY * virtualY) / maxRadius,
      angle: Math.atan2(-virtualY, virtualX)
    };
  },

  // 检查是否在死区内
  isInDeadzone: (x, y, deadzone = 0.15) => {
    const distance = Math.sqrt(x * x + y * y);
    return distance < deadzone;
  }
};

export default VirtualJoystickSync;
