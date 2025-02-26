import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';

// 自定义抽屉内容组件
const CustomDrawerContent = ({navigation}) => (
  <View style={styles.drawerContainer}>
    {/* 退出按钮 */}
    <TouchableOpacity
      style={styles.exitButton}
      onPress={() => navigation.closeDrawer()}>
      <Image
        source={require('../public/Images/return.png')}
        style={styles.returnButtonImage}
      />
    </TouchableOpacity>

    {/* 导航项 */}
    <View style={styles.navItems}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Display')}>
        <Text style={styles.navText}>画面</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Controls')}>
        <Text style={styles.navText}>操作</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Recording')}>
        <Text style={styles.navText}>录制</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// 屏幕组件
const DisplayScreen = () => (
  <View style={styles.contentContainer}>
    <Text style={styles.contentText}>画面设置</Text>
  </View>
);

const ControlsScreen = () => (
  <View style={styles.contentContainer}>
    <Text style={styles.contentText}>操作设置</Text>
  </View>
);

const RecordingScreen = () => (
  <View style={styles.contentContainer}>
    <Text style={styles.contentText}>录制设置</Text>
  </View>
);

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerType: 'permanent', // 设置抽屉一直存在
        drawerStyle: styles.drawerStyle,
        headerShown: false,
      }}>
      <Drawer.Screen name="Display" component={DisplayScreen} />
      <Drawer.Screen name="Controls" component={ControlsScreen} />
      <Drawer.Screen name="Recording" component={RecordingScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FF0000',
    paddingTop: 50,
  },
  exitButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  exitText: {
    fontSize: 32,
    color: 'white',
  },
  navItems: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navItem: {
    marginVertical: 20,
  },
  navText: {
    color: 'white',
    fontSize: 24,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#0000FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    color: 'white',
    fontSize: 32,
  },
  drawerStyle: {
    backgroundColor: '#FF0000',
    width: 240,
  },
  returnButtonImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});
