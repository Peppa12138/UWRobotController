import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import DirectionPad from './components/DirectionPad'; // 引入 DirectionPad 组件
import FunctionKeys from './components/FunctionKeys'; // 引入 FunctionKeys 组件
import SettingsButton from './components/SettingButton';
import StatusView from './components/StatusView';
import SystemNavigationBar from 'react-native-system-navigation-bar';

const App = () => {
  SystemNavigationBar.fullScreen(true); // 隐藏系统导航栏

  const handleDirectionPress = (direction) => {
    console.log(`Pressed ${direction} button`);
    // 你可以在这里添加处理方向键按下的逻辑
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <DirectionPad onPress={handleDirectionPress} />
        <FunctionKeys />
        <StatusView />
        {/* <SettingsButton /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  content: {
    alignItems: 'center',
  },
});

export default App;