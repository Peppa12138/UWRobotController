import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
// import DirectionPad from './components/DirectionPad';
// import FunctionKeys from './components/FunctionKeys';
// import SettingsButton from './components/SettingButton';
// import StatusView from './components/StatusView';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../components/LoginScreen';
import RegisterScreen from '../components/RegisterScreen';

const Stack = createStackNavigator();

const App = () => {
  SystemNavigationBar.fullScreen(true); // 隐藏系统导航栏
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
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
