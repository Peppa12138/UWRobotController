import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';

const {width, height} = Dimensions.get('window');

// 屏幕组件
const DisplayScreen = () => (
  <View style={styles.contentContainer}>
    <Text style={styles.contentText}>画面设置</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: '#0d2271',
    borderRightWidth: 1, // 右侧边框宽度
    borderRightColor: 'rgba(13, 34, 113, 1)', // 右侧边框颜色，可以自由修改
  },
  exitButton: {
    position: 'absolute',
    top: 20,
    left: width / 21,
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
    marginVertical: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navBackgroundImage: {
    position: 'absolute', // 绝对定位
    right: -width / 42,
    height: 60,
    width: width / 6.5,
  },
  navText: {
    color: 'white',
    fontSize: 28,
    zIndex: 1, // 确保文字在最上层
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#0d2271',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    color: 'white',
    fontSize: 32,
  },
  drawerStyle: {
    backgroundColor: '#0d2271',
    width: width / 6.5,
  },
  returnButtonImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  bottomImage: {
    position: 'absolute', // 绝对定位
    left: width / 5.5,
    bottom: -height / 6.5, // 距离底部 20
    width: '74%', // 覆盖整个宽度
    height: 200, // 设置图片高度
    zIndex: 999, // 确保图片在最上层
    resizeMode: 'contain', // 保持图片比例
    opacity: 0.34, // 设置不透明度为
  },
  bottomImage2: {
    position: 'absolute', // 绝对定位
    left: -width / 3.5,
    bottom: -height / 5.6, // 距离底部 20
    width: width * 1.5, // 覆盖整个宽度
    height: height / 1.8, // 设置图片高度
    zIndex: 0, // 确保图片在最上层
    resizeMode: 'contain', // 保持图片比例
    opacity: 0.25, // 设置不透明度为
    pointerEvents: 'none', // 不拦截点击事件
  },
});

export default DisplayScreen;
