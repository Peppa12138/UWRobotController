import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Router from './FrontEnd/router/router';
import Toast from 'react-native-toast-message';
import 'react-native-gesture-handler';
const App = () => {
  return (
    <>
      <Router />
      <Toast />
    </>
  );
};

export default App;
