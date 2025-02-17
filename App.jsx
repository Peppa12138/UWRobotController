import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Router from './FrontEnd/router/router';
// import Toast from 'react-native-toast-message';
import Toast from 'react-native-toast-message';
const App = () => {

  return (
    <>
      <NavigationContainer>
        <Router />
      </NavigationContainer>
      <Toast ref={ref => Toast.setRef(ref)} />
    </>
  );
};

export default App;
