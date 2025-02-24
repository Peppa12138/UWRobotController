// PreLoginScreen.js
import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native'; // 导航钩子
import {Button} from '@ant-design/react-native';
import Orientation from 'react-native-orientation-locker'; //竖屏切换组件
const {width, height} = Dimensions.get('window');

const PreLoginScreen = () => {
  const navigation = useNavigation(); // 获取导航实例
  let heights = height + 1; //解决底部白边
  Orientation.lockToLandscape(); //锁住横屏
  const handlePress = () => {
    navigation.navigate('Login'); // 跳转到登录页面
    console.log(111);
  };

  return (
    <View style={styles.container}>
      {/* 背景图片 */}
      <StatusBar hidden={true} />
      <Image
        source={require('./bgi.jpg')} // 替换为实际的背景图片链接
        style={[styles.backgroundImage, {width, heights}]}
        resizeMode="cover"
      />

      <View style={styles.centerImageContainer}>
        <Image
          source={require('./character.png')} // 替换为实际的中间图片链接
          style={styles.centerImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.topRightImageContainer}>
        <Image
          source={require('./signet.png')} // 替换为实际的右上角图片链接
          style={styles.topRightImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.bottomTextContainer}>
        <Button type="primary" size="large" onPress={handlePress}>
          请先登录后进入
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  centerImageContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -254}, {translateY: -260}],
  },
  centerImage: {
    width: 530,
  },
  topRightImageContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: 266}, {translateY: -162}],
  },
  topRightImage: {
    width: 50,
    height: 55,
  },
  bottomTextContainer: {
    position: 'absolute',
    bottom: height / 2 - 120,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 21,
    color: '#ffffff', // 字体颜色
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default PreLoginScreen;
