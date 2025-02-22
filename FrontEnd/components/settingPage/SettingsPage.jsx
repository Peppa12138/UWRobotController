import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Slider from '@react-native-community/slider';

const SettingsPage = ({ navigation, route }) => {
  const initialFontSize = route.params?.fontSize || 14; // 获取初始字体大小
  const [fontSize, setFontSize] = useState(initialFontSize);

  useEffect(() => {
    if (route.params?.fontSize) {
      setFontSize(route.params.fontSize);
    }
  }, [route.params?.fontSize]);

  const handleFontSizeChange = (value) => {
    setFontSize(value);
    navigation.setParams({ fontSize: value }); // 更新字体大小并传递给操作页面
  };

  const handleGoBack = () => {
    navigation.navigate('OperationScreen', { fontSize }); // 返回并传递字体大小
  };

  const handleLogout = () => {
    navigation.navigate('PreLogin'); // 登出并跳转到 PreLogin 页面
  };

  return (
    <View style={styles.container}>
      {/* 返回按钮 */}
      <TouchableOpacity style={styles.returnButton} onPress={handleGoBack}>
        <Image
          source={require('../public/Images/return.png')}
          style={styles.returnButtonImage}
        />
      </TouchableOpacity>

      {/* 弹窗内容 */}
      <View style={styles.modalContent}>
        <Text style={styles.label}>字号：</Text>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={30}
          step={1}
          value={fontSize}
          onValueChange={handleFontSizeChange}
          thumbTintColor="#FF5722"
          minimumTrackTintColor="#FF5722"
          maximumTrackTintColor="#FFFFFF"
          trackStyle={styles.trackStyle}
          thumbStyle={styles.thumbStyle}
        />
      </View>

      {/* 登出按钮 */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Image
          source={require('../public/Images/logout.png')} // 替换为你的登出图片路径
          style={styles.logoutButtonImage}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // 半透明背景
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%', // 弹窗宽度为屏幕宽度的80%
    backgroundColor: '#333', // 弹窗背景色
    borderRadius: 10, // 圆角
    padding: 20,
    alignItems: 'center',
  },
  returnButton: {
    position: 'absolute', // 绝对定位
    top: 40, // 距离顶部 40
    left: 20, // 距离左侧 20
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  returnButtonImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  slider: {
    width: '100%', // 滑动条宽度占满弹窗
    height: 40,
  },
  trackStyle: {
    height: 4,
    borderRadius: 2,
  },
  thumbStyle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF5722',
  },
  logoutButton: {
    marginTop: 20, // 与上方内容的间距
    backgroundColor: '#FF5722', // 按钮背景色
    borderRadius: 20, // 圆角
    padding: 10, // 内边距
    justifyContent: 'center',
    alignItems: 'center',
    width: 40, // 按钮宽度
    height: 40, // 按钮高度
  },
  logoutButtonImage: {
    width: 20, // 图片宽度
    height: 20, // 图片高度
    resizeMode: 'contain', // 保持图片比例
  },
});

export default SettingsPage;