import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
// import DirectionPad from './components/DirectionPad';
// import FunctionKeys from './components/FunctionKeys';
// import SettingsButton from './components/SettingButton';
// import StatusView from './components/StatusView';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
// import LoginScreen from './components/LoginScreen';
// import RegisterScreen from './components/RegisterScreen';
import Otherindex from './src_other/Otherindex';

const Stack = createStackNavigator();

const App = () => {
  SystemNavigationBar.fullScreen(true); // 隐藏系统导航栏
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
  // const [isStatusViewVisible, setIsStatusViewVisible] = useState(false); // 控制 StatusView 的显示状态

  // const handleDirectionPress = (direction) => {
  //   console.log(`Pressed ${direction} button`);
  //   // 你可以在这里添加处理方向键按下的逻辑
  // };

  // // 设置按钮的点击事件
  // const handleSettingsPress = () => {
  //   console.log('Settings button pressed');
  //   setIsStatusViewVisible(!isStatusViewVisible); // 切换 StatusView 的显示状态
  // };

  // return (
  //   <View style={styles.container}>
  //     <View style={styles.content}>
  //       <DirectionPad onPress={handleDirectionPress} />
  //       <FunctionKeys />
  //       {/* 根据状态变量控制 StatusView 的显示 */}
  //       {isStatusViewVisible && <StatusView />}
  //       <SettingsButton onPress={handleSettingsPress} />
  //     </View>
  //   </View>
  // );
};

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
