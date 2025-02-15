import {Text, View} from 'react-native';
import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Login from './src_Login/Login';
export default class App extends Component {
  render() {
    return (
      <NavigationContainer>
        <Login />
      </NavigationContainer>
    );
  }
}
