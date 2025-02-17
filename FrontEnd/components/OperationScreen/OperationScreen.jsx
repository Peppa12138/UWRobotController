import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

import DirectionPad from '../Operations/DirectionPad';
import FunctionKeys from '../Operations/FunctionKeys';
import SettingsButton from '../Operations/SettingButton';
import StatusView from '../Operations/StatusView';

const ControlPanel = () => {
  const navigation = useNavigation();
  const route = useRoute(); // 获取当前路由
  const [fontSize, setFontSize] = useState(route.params?.fontSize || 14); // 初始字体大小

  // 每次页面获得焦点时更新 fontSize
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.fontSize) {
        setFontSize(route.params.fontSize); // 更新字体大小
      }
    }, [route.params?.fontSize])
  );

  const handleSettingsPress = () => {
    navigation.navigate('Settings'); // 跳转到设置页面
  };

  const handleDirectionPress = (direction) => {
    console.log(`Pressed ${direction} button`);
  };

  return (
    <ImageBackground
      source={require('../public/Images/opBackground.png')} // 替换为你的背景图片路径
      style={styles.container}
      resizeMode="cover"
    >
      {/* 左手操作区域 */}
      <View style={styles.leftPanel}>
        <DirectionPad onPress={handleDirectionPress} />
      </View>

      {/* 右手操作区域 */}
      <View style={styles.rightPanel}>
        <FunctionKeys />
      </View>

      {/* 设置按钮 */}
      <SettingsButton onPress={handleSettingsPress} />

      {/* 状态视图，传递字体大小 */}
      <View style={styles.statusViewContainer}>
        <StatusView fontSize={fontSize} />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // 如果图片加载失败，保持原来的背景颜色
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