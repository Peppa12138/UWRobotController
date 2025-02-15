import {Text, View} from 'react-native';
import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Otherindex from './src_other/Otherindex';
export default class App extends Component {
  render() {
    return (
      <NavigationContainer>
        <Otherindex />
      </NavigationContainer>
    );
  }
}
