import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Video from 'react-native-video';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

import DirectionPad from '../Operations/DirectionPad';
import FunctionKeys from '../Operations/FunctionKeys';
import StatusView from '../Operations/StatusView';
import VirtualJoystick from '../VirtualJoystick/VirtualJoystick'; // 物理摇杆组件
import ReturnButton from '../Operations/ReturnButton'; // 返回按钮组件
import NetworkStatus from '../Operations/NetworkStatus'; // 网络状态组件
import VideoStats from '../Operations/VideoStats'; // 视频状态组件

const ControlPanel = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [fontSize, setFontSize] = useState(route.params?.fontSize || 14);
  const [controlMode, setControlMode] = useState(route.params?.controlMode || 1);
  const [statusData, setStatusData] = useState({});
  const [activeTouchId, setActiveTouchId] = useState(null);  // 用于标记哪个手指在控制摇杆
  const [isMuted, setIsMuted] = useState(false);  // 用于控制视频是否静音
  const [isPaused, setIsPaused] = useState(false);  // 用于控制视频是否暂停

  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        const response = await axios.get('http://10.0.2.2:5000/api/status');
        setStatusData(response.data);
      } catch (error) {
        console.error('获取状态数据失败:', error);
      }
    };

    const intervalId = setInterval(fetchStatusData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.fontSize) {
        setFontSize(route.params.fontSize);
      }
      if (route.params?.controlMode !== undefined) {
        setControlMode(route.params.controlMode);
      }
    }, [route.params?.fontSize, route.params?.controlMode]),
  );

  const handleSettingsPress = () => {
    navigation.navigate('Settings', { fontSize, controlMode });
  };

  const handleDirectionPress = direction => {
    console.log(`Pressed ${direction} button`);
  };

  const handleTouchStart = (e) => {
    const touchId = e.nativeEvent.touchId;
    setActiveTouchId(touchId);
  };

  const handleTouchMove = (e, gestureState) => {
    if (activeTouchId && e.nativeEvent.touchId === activeTouchId) {
      const joystickElement = e.target;
      joystickElement.measure((x, y, width, height, pageX, pageY) => {
        const offsetX = gestureState.moveX - pageX;
        const offsetY = gestureState.moveY - pageY;
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        
        const maxDistance = joystickElement.clientWidth / 2;
        if (distance <= maxDistance) {
          // Update joystick position here
        }
      });
    }
  };

  const handleTouchEnd = (e) => {
    if (e.nativeEvent.touchId === activeTouchId) {
      setActiveTouchId(null);  // 清除触摸状态
    }
  };

  const toggleMute = () => {
    setIsMuted(prevState => !prevState);
  };

  // 切换视频暂停状态
  const handleReturnButtonPress = () => {
    setIsPaused(true);  // 暂停视频
    navigation.navigate('AfterLogin');
  };

  const renderControl = () => {
    if (controlMode === 1) {
      return <DirectionPad onPress={handleDirectionPress} />;
    } else if (controlMode === 2) {
      return <VirtualJoystick onMove={data => console.log(data)} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* 视频背景 */}
      <Video
        source={require('../public/Images/background.mp4')}
        style={StyleSheet.absoluteFill}
        muted={isMuted}
        paused={isPaused}  // 根据 isPaused 控制视频播放
        repeat={true}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.leftPanel}>
          <VirtualJoystick
            onMove={data => console.log(data)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </View>
        <View style={styles.rightPanel}>
          <FunctionKeys />
        </View>
        <ReturnButton onPress={handleReturnButtonPress} />
        <View style={styles.statusViewContainer}>
          <StatusView fontSize={fontSize} statusData={statusData} />
        </View>
      </View>

      {/* 网络状态监控 */}
      <NetworkStatus />

      {/* 视频状态监控 */}
      <VideoStats />

      {/* 静音按钮 */}
      <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
        <Image
          source={isMuted ? require('../public/Images/mute_icon.png') : require('../public/Images/unmute_icon.png')}
          style={styles.muteIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  leftPanel: {
    position: 'absolute',
    bottom: 20,
    left: 100,
  },
  rightPanel: {
    position: 'absolute',
    bottom: 20,
    right: 80,
  },
  statusViewContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  muteButton: {
    position: 'absolute',
    top: 2,
    right: 40,
    zIndex: 20,
    padding: 10,
  },
  muteIcon: {
    width: 30,
    height: 30,
  },
});

export default ControlPanel;
