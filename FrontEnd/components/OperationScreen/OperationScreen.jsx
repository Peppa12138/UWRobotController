import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

import DirectionPad from '../Operations/DirectionPad';
import FunctionKeys from '../Operations/FunctionKeys';
import SettingsButton from '../Operations/SettingButton';
import StatusView from '../Operations/StatusView';

const ControlPanel = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [fontSize, setFontSize] = useState(route.params?.fontSize || 14);
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
    }, [route.params?.fontSize]),
  );

  const handleSettingsPress = () => {
    navigation.navigate('Settings', { fontSize }); // 打开设置页面并传递 fontSize
  };

  const handleDirectionPress = (direction) => {
    console.log(`Pressed ${direction} button`);
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
      {/* 内容区域 */}
      <View style={styles.content}>
        <View style={styles.leftPanel}>
          <DirectionPad onPress={handleDirectionPress} />
        </View>
        <View style={styles.rightPanel}>
          <FunctionKeys />
        </View>
        <SettingsButton onPress={handleSettingsPress} />
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
