import React from 'react';
import { TouchableOpacity, View, StyleSheet, Image, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window'); // 获取屏幕宽度和高度

const DirectionPad = ({ onPress }) => {
  const handlePressIn = (direction) => {
    // 按下时的视觉反馈处理（如需要可以添加动画）
    onPress(direction);
  };

  return (
    <View style={styles.directionPad}>
      {/* 上按钮 */}
      <View style={styles.upButtonContainer}>
        <TouchableOpacity
          onPress={() => handlePressIn('up')}
          activeOpacity={0.7} // 添加按下透明度反馈
        >
          <Image
            source={require('../public/Images/up.png')}
            style={styles.upButtonImage}
          />
        </TouchableOpacity>
      </View>

      {/* 下按钮 */}
      <View style={styles.downButtonContainer}>
        <TouchableOpacity
          onPress={() => handlePressIn('down')}
          activeOpacity={0.7} // 添加按下透明度反馈
        >
          <Image
            source={require('../public/Images/down.png')}
            style={styles.downButtonImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  directionPad: {
    flex: 1,
    position: 'relative', // 设置为相对定位，以便子元素可以使用绝对定位
  },
  upButtonImage: {
    width: width * 0.06, // 上按钮图片尺寸
    height: width * 0.06, // 保持比例
    resizeMode: 'contain', // 保持图片完整显示
  },
  downButtonImage: {
    width: width * 0.06, // 下按钮图片尺寸
    height: width * 0.06, // 保持比例
    resizeMode: 'contain', // 保持图片完整显示
  },
  upButtonContainer: {
    position: 'absolute', // 使用绝对定位
    top: height * 0.55, // 上按钮位置
    left: width * 0.74, // 统一的水平位置
  },
  downButtonContainer: {
    position: 'absolute', // 使用绝对定位
    top: height * 0.76, // 下按钮位置，与上按钮保持适当间距
    left: width * 0.74, // 与上按钮对齐，使用相同的left值
  },
});

export default DirectionPad;