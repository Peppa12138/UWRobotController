import React, {useEffect, useRef, useState} from 'react';
import {DeviceEventEmitter, Alert} from 'react-native';

class GameSirX2sManager {
  constructor() {
    this.gamepad = null;
    this.animationFrame = null;
    this.isConnected = false;
    this.listeners = new Set();
    this.deadzone = 0.15; // 摇杆死区，避免漂移
    
    // 上一次的状态，用于检测变化
    this.lastState = {
      leftStick: {x: 0, y: 0},
      rightStick: {x: 0, y: 0},
      buttons: {},
    };

    // GameSir X2s 特定的按键映射
    this.buttonMap = {
      0: 'A',        // A按钮
      1: 'B',        // B按钮  
      2: 'X',        // X按钮
      3: 'Y',        // Y按钮
      4: 'LB',       // 左肩键
      5: 'RB',       // 右肩键
      6: 'LT',       // 左扳机
      7: 'RT',       // 右扳机
      8: 'Select',   // 选择键
      9: 'Start',    // 开始键
      10: 'LS',      // 左摇杆按下
      11: 'RS',      // 右摇杆按下
      12: 'Up',      // 方向键上
      13: 'Down',    // 方向键下
      14: 'Left',    // 方向键左
      15: 'Right',   // 方向键右
    };
  }

  // 初始化手柄监听
  init() {
    console.log('初始化GameSir X2s手柄管理器...');
    
    if (typeof window !== 'undefined' && window.navigator.getGamepads) {
      window.addEventListener('gamepadconnected', this.onGamepadConnected.bind(this));
      window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected.bind(this));
      
      // 开始轮询检测手柄
      this.pollGamepads();
    } else {
      console.warn('当前环境不支持Gamepad API');
    }
  }

  // 手柄连接事件
  onGamepadConnected(event) {
    const gamepadId = event.gamepad.id.toLowerCase();
    console.log('检测到手柄连接:', event.gamepad.id);
    
    // 检查是否为GameSir X2s或兼容手柄
    if (this.isGameSirX2s(gamepadId)) {
      this.gamepad = event.gamepad;
      this.isConnected = true;
      
      console.log('GameSir X2s手柄连接成功');
      Alert.alert(
        '🎮 手柄连接成功', 
        'GameSir X2s已连接\n摇杆同步功能已启用'
      );
      
      this.notifyListeners('connected', {
        gamepad: event.gamepad,
        type: 'gamesir_x2s'
      });
      
      this.startPolling();
    } else {
      console.log('连接的不是GameSir X2s手柄:', event.gamepad.id);
    }
  }

  // 检查是否为GameSir X2s手柄
  isGameSirX2s(gamepadId) {
    return gamepadId.includes('gamesir') || 
           gamepadId.includes('x2s') ||
           gamepadId.includes('3537'); // GameSir的厂商ID
  }

  // 手柄断开事件
  onGamepadDisconnected(event) {
    if (this.gamepad && event.gamepad.index === this.gamepad.index) {
      console.log('GameSir X2s手柄已断开');
      this.gamepad = null;
      this.isConnected = false;
      this.stopPolling();
      
      this.notifyListeners('disconnected', {gamepad: event.gamepad});
      Alert.alert('手柄断开', 'GameSir X2s连接已断开');
    }
  }

  // 开始轮询手柄状态
  startPolling() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.pollGamepadState();
  }

  // 停止轮询
  stopPolling() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  // 轮询检测手柄连接
  pollGamepads() {
    if (typeof window === 'undefined' || !window.navigator.getGamepads) {
      return;
    }

    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i] && !this.gamepad) {
        const gamepadId = gamepads[i].id.toLowerCase();
        if (this.isGameSirX2s(gamepadId)) {
          this.onGamepadConnected({gamepad: gamepads[i]});
          break;
        }
      }
    }
    
    // 每秒检查一次新连接
    setTimeout(() => this.pollGamepads(), 1000);
  }

  // 轮询手柄状态
  pollGamepadState() {
    if (!this.isConnected || !this.gamepad) {
      return;
    }

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[this.gamepad.index];
    
    if (!gamepad) {
      console.log('手柄已断开');
      this.onGamepadDisconnected({gamepad: this.gamepad});
      return;
    }

    // 读取左摇杆数据 (axes[0] = X轴, axes[1] = Y轴)
    const leftStick = {
      x: this.applyDeadzone(gamepad.axes[0] || 0),
      y: this.applyDeadzone(gamepad.axes[1] || 0),
    };

    // 读取右摇杆数据 (axes[2] = X轴, axes[3] = Y轴) 
    const rightStick = {
      x: this.applyDeadzone(gamepad.axes[2] || 0),
      y: this.applyDeadzone(gamepad.axes[3] || 0),
    };

    // 检查左摇杆是否有变化
    if (this.hasStickChanged(leftStick, this.lastState.leftStick)) {
      this.notifyListeners('leftStick', leftStick);
      this.lastState.leftStick = {...leftStick};
      
      // 输出调试信息
      console.log(`左摇杆: X=${leftStick.x.toFixed(3)}, Y=${leftStick.y.toFixed(3)}`);
    }

    // 检查右摇杆是否有变化
    if (this.hasStickChanged(rightStick, this.lastState.rightStick)) {
      this.notifyListeners('rightStick', rightStick);
      this.lastState.rightStick = {...rightStick};
      
      console.log(`右摇杆: X=${rightStick.x.toFixed(3)}, Y=${rightStick.y.toFixed(3)}`);
    }

    // 读取按钮状态
    gamepad.buttons.forEach((button, index) => {
      const wasPressed = this.lastState.buttons[index] || false;
      const isPressed = button.pressed;
      
      if (isPressed !== wasPressed) {
        const buttonName = this.buttonMap[index] || `Button${index}`;
        
        this.notifyListeners('button', {
          index,
          name: buttonName,
          pressed: isPressed,
          value: button.value,
        });
        
        this.lastState.buttons[index] = isPressed;
        
        console.log(`按钮 ${buttonName} ${isPressed ? '按下' : '释放'}`);
      }
    });

    // 继续下一帧
    this.animationFrame = requestAnimationFrame(() => this.pollGamepadState());
  }

  // 应用死区，避免摇杆漂移
  applyDeadzone(value) {
    return Math.abs(value) < this.deadzone ? 0 : value;
  }

  // 检查摇杆是否有变化
  hasStickChanged(newStick, oldStick) {
    const threshold = 0.01; // 变化阈值
    return Math.abs(newStick.x - oldStick.x) > threshold || 
           Math.abs(newStick.y - oldStick.y) > threshold;
  }

  // 添加监听器
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // 通知所有监听器
  notifyListeners(type, data) {
    this.listeners.forEach(callback => {
      try {
        callback(type, data);
      } catch (error) {
        console.error('手柄监听器错误:', error);
      }
    });

    // 通过React Native事件系统广播
    DeviceEventEmitter.emit('gamepadEvent', {type, data});
  }

  // 获取当前连接状态
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      gamepad: this.gamepad,
      type: 'gamesir_x2s'
    };
  }

  // 设置死区大小
  setDeadzone(deadzone) {
    this.deadzone = Math.max(0, Math.min(1, deadzone));
    console.log('摇杆死区设置为:', this.deadzone);
  }

  // 销毁管理器
  destroy() {
    this.stopPolling();
    this.listeners.clear();
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('gamepadconnected', this.onGamepadConnected);
      window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);
    }
    
    console.log('GameSir X2s管理器已销毁');
  }
}

// 创建单例实例
const gameSirManager = new GameSirX2sManager();

// React Hook for GameSir X2s
export const useGameSirX2s = () => {
  const [connected, setConnected] = useState(false);
  const [gamepadInfo, setGamepadInfo] = useState(null);

  useEffect(() => {
    // 添加监听器
    const removeListener = gameSirManager.addListener((type, data) => {
      switch (type) {
        case 'connected':
          setConnected(true);
          setGamepadInfo(data.gamepad);
          break;
        case 'disconnected':
          setConnected(false);
          setGamepadInfo(null);
          break;
      }
    });

    // 检查初始连接状态
    const status = gameSirManager.getConnectionStatus();
    setConnected(status.connected);
    setGamepadInfo(status.gamepad);

    return removeListener;
  }, []);

  return {
    connected,
    gamepadInfo,
    manager: gameSirManager,
  };
};

export default gameSirManager;
