import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

import DirectionPad from '../Operations/DirectionPad';
import FunctionKeys from '../Operations/FunctionKeys';
// import SettingsButton from '../Operations/SettingButton';
import StatusView from '../Operations/StatusView';
import VirtualJoystick from '../VirtualJoystick/VirtualJoystick'; // 物理摇杆组件
import ReturnButton from '../Operations/ReturnButton'; // 返回按钮组件

const ControlPanel = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [fontSize, setFontSize] = useState(route.params?.fontSize || 14);
  const [controlMode, setControlMode] = useState(
    route.params?.controlMode || 1,
  );
  const [statusData, setStatusData] = useState({});

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
    navigation.navigate('Settings', {fontSize, controlMode}); // 打开设置页面并传递 fontSize
  };

  const handleDirectionPress = direction => {
    console.log(`Pressed ${direction} button`);
  };

  // 在 ControlPanel 中根据 controlMode 显示不同的操作界面
  const renderControl = () => {
    if (controlMode === 1) {
      return <DirectionPad onPress={handleDirectionPress} />; // 显示虚拟按键
    } else if (controlMode === 2) {
      return <VirtualJoystick onMove={data => console.log(data)} />; // 显示物理摇杆
    }
  };

  return (
    <View style={styles.container}>
      {/* 视频背景 */}
      <Video
        source={require('../public/Images/background.mp4')}
        style={StyleSheet.absoluteFill}
        muted={true}
        repeat={true}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.leftPanel}>
          {/* {renderControl()} */}
          <VirtualJoystick onMove={data => console.log(data)} />
        </View>
        <View style={styles.rightPanel}>
          <FunctionKeys />
        </View>
        {/* <SettingsButton onPress={handleSettingsPress} /> */}
        <ReturnButton onPress={() => navigation.navigate('AfterLogin')}/>
        <View style={styles.statusViewContainer}>
          <StatusView fontSize={fontSize} statusData={statusData} />
        </View>
      </View>
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
});

export default ControlPanel;
