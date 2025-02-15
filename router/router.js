import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../components/InitialScreen/LoginScreen';
import RegisterScreen from '../components/InitialScreen/RegisterScreen';
import OperationScreen from '../OperationScreen/OperationScreen';
import PreLoginScreen from '../components/PreLogin/PreLogin';
import SettingsPage from '../components/settingPage/SettingsPage'; // 导入设置页面

const Stack = createStackNavigator();

const App = () => {
  SystemNavigationBar.fullScreen(true); // 隐藏系统导航栏
  return (
    <Stack.Navigator initialRouteName="PreLogin">
      <Stack.Screen
        name="PreLogin"
        component={PreLoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OperationScreen" component={OperationScreen} />
      <Stack.Screen name="Settings" component={SettingsPage} /> 
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
