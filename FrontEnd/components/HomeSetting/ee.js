import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer, useNavigation} from '@react-navigation/native';

// 画面设置页面
function ScreenSettings() {
  return (
    <SafeAreaView style={styles.screenContainer}>
      <Text style={styles.text}>画面设置内容</Text>
    </SafeAreaView>
  );
}

// 操作设置页面
function OperationSettings() {
  return (
    <SafeAreaView style={styles.screenContainer}>
      <Text style={styles.text}>操作设置内容</Text>
    </SafeAreaView>
  );
}

// 录制设置页面
function RecordingSettings() {
  return (
    <SafeAreaView style={styles.screenContainer}>
      <Text style={styles.text}>录制设置内容</Text>
    </SafeAreaView>
  );
}

// 左边菜单部分（包含退出按钮和路由按钮）
function LeftMenu() {
  const navigation = useNavigation(); // 获取导航对象

  return (
    <View style={styles.leftContainer}>
      <TouchableOpacity onPress={() => console.log('退出')}>
        <Text style={styles.exitText}>退出</Text>
      </TouchableOpacity>
      <View style={styles.menuButtons}>
        <TouchableOpacity onPress={() => navigation.navigate('画面设置')}>
          <Text style={styles.menuButtonText}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('操作设置')}>
          <Text style={styles.menuButtonText}>2</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('录制设置')}>
          <Text style={styles.menuButtonText}>3</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
function Right() {
  return (
    <Stack.Navigator initialRouteName="画面设置">
      <Stack.Screen name="画面设置" component={ScreenSettings} />
      <Stack.Screen name="操作设置" component={OperationSettings} />
      <Stack.Screen name="录制设置" component={RecordingSettings} />
    </Stack.Navigator>
  );
}

const Stack = createStackNavigator();

function App() {
  return (
    <View style={styles.appContainer}>
      <LeftMenu />
      <Right />
    </View>
  );
}

// 样式部分
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftContainer: {
    width: 70,
    backgroundColor: 'red',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  exitText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  menuButtons: {
    justifyContent: 'center',
    flex: 1,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 20,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});

// import React, {useState, useEffect} from 'react';
// import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
// import Slider from '@react-native-community/slider';

// const App = ({navigation, route}) => {
//   const initialFontSize = route.params?.fontSize || 14; // 从导航参数获取初始字体大小
//   const [fontSize, setFontSize] = useState(initialFontSize); // 字体大小状态

//   useEffect(() => {
//     // 监听 route.params 的变化，并在变化时更新 fontSize
//     if (route.params?.fontSize) {
//       setFontSize(route.params.fontSize);
//     }
//   }, [route.params?.fontSize]);

//   // 处理字体大小变化
//   const handleFontSizeChange = value => {
//     setFontSize(value); // 更新字体大小状态
//     navigation.setParams({fontSize: value}); // 更新导航参数
//   };

//   // 返回操作页面
//   const handleGoBack = () => {
//     navigation.navigate('OperationScreen', {fontSize}); // 携带最新的 fontSize 返回
//   };

//   return (
//     <View style={styles.container}>
//       {/* 列框部分（左侧） */}
//       <View style={styles.columnContainer}>
//         {/* 返回按钮 */}
//         <TouchableOpacity style={styles.returnButton} onPress={handleGoBack}>
//           <Image
//             source={require('../public/Images/return.png')}
//             style={styles.returnButtonImage}
//           />
//         </TouchableOpacity>

//         {/* 标签部分 */}

//         <Text style={styles.label}>画面</Text>
//         <Text style={styles.label}>操作</Text>

//         {/* 字号调整部分 */}
//         <View style={styles.fontSizeContainer}>
//           <Text style={styles.fontSizeLabel}>字号：</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={10}
//             maximumValue={30}
//             step={1}
//             value={fontSize}
//             onValueChange={handleFontSizeChange}
//             // 自定义滑动条样式
//             thumbTintColor="#FF5722" // 滑块颜色
//             minimumTrackTintColor="#FF5722" // 已滑动部分轨道颜色
//             maximumTrackTintColor="#FFFFFF" // 未滑动部分轨道颜色
//             trackStyle={styles.trackStyle} // 轨道样式
//             thumbStyle={styles.thumbStyle} // 滑块样式
//           />
//           <Text style={[styles.label, {fontSize}]}>
//             当前字体大小: {fontSize}
//           </Text>
//         </View>
//         <TouchableOpacity
//           style={styles.settingItem}
//           onPress={() => navigation.navigate('PreLogin')}>
//           <Text style={styles.label}>登出</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1976D2',
//     padding: 20,
//   },
//   columnContainer: {
//     flexDirection: 'column',
//     alignItems: 'flex-start', // 确保所有内容靠左对齐
//     justifyContent: 'flex-start',
//   },
//   returnButton: {
//     width: 80,
//     height: 60,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   returnButtonImage: {
//     width: 40,
//     height: 40,
//     resizeMode: 'contain',
//   },
//   label: {
//     fontSize: 25,
//     color: '#fff',
//     marginBottom: 20,
//     textAlign: 'left',
//   },
//   fontSizeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   fontSizeLabel: {
//     fontSize: 25,
//     color: '#fff',
//     marginRight: 10,
//   },
//   slider: {
//     width: 200,
//     height: 40, // 增加滑动条高度
//   },
//   trackStyle: {
//     height: 4, // 轨道高度
//     borderRadius: 2, // 轨道圆角
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   thumbStyle: {
//     width: 20,
//     height: 20,
//     borderRadius: 10, // 滑块圆角
//     backgroundColor: '#FF5722', // 滑块背景色
//     shadowColor: '#FF5722',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.5,
//     shadowRadius: 2,
//   },
// });

export default App;
