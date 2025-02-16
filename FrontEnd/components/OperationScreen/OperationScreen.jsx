import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // 导航钩子
import DirectionPad from '../Operations/DirectionPad';
import FunctionKeys from '../Operations/FunctionKeys';
import SettingsButton from '../Operations/SettingButton';
import StatusView from '../Operations/StatusView';
import SystemNavigationBar from 'react-native-system-navigation-bar';

const ControlPanel = () => {
  // SystemNavigationBar.fullScreen(true); // 隐藏系统导航栏

  const navigation = useNavigation(); // 获取导航实例

  const handleSettingsPress = () => {
    navigation.navigate('Settings'); // 跳转到设置页面
  };

  const handleDirectionPress = direction => {
    console.log(`Pressed ${direction} button`);
    // 你可以在这里添加处理方向键按下的逻辑
  };

  return (
    <View style={styles.container}>
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

      {/* 状态视图始终显示 */}
      <StatusView />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  leftPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  rightPanel: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});

export default ControlPanel;