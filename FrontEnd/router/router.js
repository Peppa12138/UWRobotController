import React, {useState, useEffect} from 'react';
import {Alert, BackHandler, StyleSheet} from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import {NavigationContainer} from '@react-navigation/native'; // 必须包裹 NavigationContainer
import {createStackNavigator} from '@react-navigation/stack';
// import LoginScreen from '../components/InitialScreen/LoginScreen';
// import RegisterScreen from '../components/InitialScreen/RegisterScreen';
import OperationScreen from '../components/OperationScreen/OperationScreen';
// import PreLoginScreen from '../components/PreLogin/PreLogin';
import HomeSetting from '../components/HomeSetting/HomeSetting'; // 导入设置页面
import AfterLoginScreen from '../components/AfterLogin/AfterLogin';
// import UserInformation from '../components/UserInformation/UserInformation';
// import ChangePassword from '../components/ChangePassword/ChangePassword';
import fontSizeManager from '../utils/FontSizeManager'; // 导入字体管理器
import displaySettingsManager from '../utils/DisplaySettingsManager'; // 导入显示设置管理器

const Stack = createStackNavigator();

const App = () => {
  SystemNavigationBar.fullScreen(true); // 隐藏系统导航栏

  useEffect(() => {
    // 初始化字体管理器
    fontSizeManager.loadFontSize();
    
    // 初始化显示设置管理器
    displaySettingsManager.loadDisplaySettings();
    
    const backAction = () => {
      // Alert.alert("返回功能已禁用", "请使用其他方式导航");
      return true; // 仅阻止物理返回键，不影响程序内的导航
    };

    // 添加返回键事件监听器
    BackHandler.addEventListener('hardwareBackPress', backAction);

    // 清理监听器，防止内存泄漏
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, []);

  return (
    <NavigationContainer>
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
          options={{headerShown: false, gestureEnabled: false}}
        />
        <Stack.Screen
          name="OperationScreen"
          component={OperationScreen}
          options={{headerShown: false, gestureEnabled: false}}
        />
        <Stack.Screen
          name="HomeSetting"
          component={HomeSetting}
          options={{
            headerShown: false,
            gestureEnabled: false,
            presentation: 'modal', // 设置为模态框
          }}
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
    </NavigationContainer>
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
