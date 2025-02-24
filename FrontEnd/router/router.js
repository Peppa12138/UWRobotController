import React, { useState, useEffect } from 'react';
import { Alert, BackHandler, StyleSheet } from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { createStackNavigator } from '@react-navigation/stack';
// import LoginScreen from '../components/InitialScreen/LoginScreen';
// import RegisterScreen from '../components/InitialScreen/RegisterScreen';
import OperationScreen from '../components/OperationScreen/OperationScreen';
// import PreLoginScreen from '../components/PreLogin/PreLogin';
import SettingsPage from '../components/SettingPage/SettingsPage'; // 导入设置页面
import AfterLoginScreen from '../components/AfterLogin/AfterLogin';
// import UserInformation from '../components/UserInformation/UserInformation';
// import ChangePassword from '../components/ChangePassword/ChangePassword';
const Stack = createStackNavigator();

const App = () => {
  SystemNavigationBar.fullScreen(true); // 隐藏系统导航栏

  useEffect(() => {
    const backAction = () => {
      // Alert.alert("返回功能已禁用", "请使用其他方式导航");
      return true; // 阻止返回键的默认行为
    };

    // 添加返回键事件监听器
    BackHandler.addEventListener('hardwareBackPress', backAction);

    // 清理监听器，防止内存泄漏
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, []);

  return (
    <Stack.Navigator initialRouteName="AfterLogin">
      {/* <Stack.Screen
        name="PreLogin"
        component={PreLoginScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      /> */}
      <Stack.Screen
        name="AfterLogin"
        component={AfterLoginScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="OperationScreen"
        component={OperationScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      {/* <Stack.Screen
        name="Settings"
        component={SettingsPage}
        options={{
          headerShown: false,
          gestureEnabled: false,
          presentation: 'modal', // 设置为模态框
        }}
      /> */}
      {/* <Stack.Screen
        name="UserInformation"
        component={UserInformation}
        options={{ headerShown: false, gestureEnabled: false }}
      /> */}
      {/* <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{ headerShown: false, gestureEnabled: false }}
      /> */}
    </Stack.Navigator>
  );
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
