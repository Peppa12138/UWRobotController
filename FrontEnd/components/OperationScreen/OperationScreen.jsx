import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import axios from 'axios';

import DirectionPad from '../Operations/DirectionPad';
import FunctionKeys from '../Operations/FunctionKeys';
import StatusView from '../Operations/StatusView';
import VirtualJoystick from '../VirtualJoystick/VirtualJoystick';
import ReturnButton from '../Operations/ReturnButton';
import NetworkStatus from '../Operations/NetworkStatus';
import VideoStats from '../Operations/VideoStats';

const {width, height} = Dimensions.get('window');

const ControlPanel = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [fontSize, setFontSize] = useState(route.params?.fontSize || 14);
  const [controlMode, setControlMode] = useState(
    route.params?.controlMode || 1,
  );
  const [statusData, setStatusData] = useState({});
  const [activeTouchId, setActiveTouchId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

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

  const handleDirectionPress = direction => {
    console.log(`Pressed ${direction} button`);
  };

  const handleTouchStart = e => {
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

        const maxDistance = width / 2;
        if (distance <= maxDistance) {
          // Update joystick position here
        }
      });
    }
  };

  const handleTouchEnd = e => {
    if (e.nativeEvent.touchId === activeTouchId) {
      setActiveTouchId(null);
    }
  };

  const toggleMute = () => {
    setIsMuted(prevState => !prevState);
  };

  const handleReturnButtonPress = () => {
    setIsPaused(true);
    navigation.navigate('AfterLogin');
  };

  return (
    <View style={styles.container}>
      <Video
        source={require('../public/Videos/background.mp4')}
        style={StyleSheet.absoluteFill}
        muted={isMuted}
        paused={isPaused}
        repeat={true}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.leftPanel}>
          {/* 根据操作模式显示虚拟摇杆 */}
          {controlMode === 1 && (
            <VirtualJoystick
              // onMove={data => console.log(data)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          )}
        </View>
        <View style={styles.rightPanel}>
          <FunctionKeys />
        </View>
        <ReturnButton onPress={handleReturnButtonPress} />
        <View style={styles.statusViewContainer}>
          <StatusView fontSize={fontSize} statusData={statusData} />
        </View>
      </View>

      <NetworkStatus />
      <VideoStats />

      <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
        <Image
          source={
            isMuted
              ? require('../public/Images/mute_icon.png')
              : require('../public/Images/unmute_icon.png')
          }
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
    bottom: height * 0.05,
    left: width * 0.1,
  },
  rightPanel: {
    position: 'absolute',
    bottom: height * 0.05,
    right: width * 0.1,
  },
  statusViewContainer: {
    position: 'absolute',
    top: height * 0.03,
    left: width * 0.05,
    zIndex: 10,
  },
  muteButton: {
    position: 'absolute',
    top: height * 0.003,
    right: width * 0.09,
    zIndex: 10,
    padding: 10,
    width: width * 0.01, // 设置按钮的宽度
    height: width * 0.1, // 设置按钮的高度
    borderRadius: (width * 0.12) / 2, // 使按钮圆形
  },

  muteIcon: {
    width: width * 0.04, // 设置图标的宽度
    height: width * 0.04, // 设置图标的高度
  },
});

export default ControlPanel;
