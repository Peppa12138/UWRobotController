/**
 * @format
 */
import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';
import 'react-native-reanimated';

// 临时忽略 Reanimated 警告
LogBox.ignoreLogs([
  'It looks like you might be using shared value\'s .value inside reanimated inline style',
]);

AppRegistry.registerComponent(appName, () => App);
