import React from 'react';
import { TouchableOpacity, View, StyleSheet, Image, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window'); // 获取屏幕宽度和高度

const DirectionPad = ({ onPress }) => {
  return (
    <View style={styles.directionPad}>
      {/* 上按钮 */}
      <View style={styles.upButtonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.upButton]}
          onPress={() => onPress('up')}
        >
          <Image
            source={require('../public/Images/up.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      </View>

      {/* 下按钮 */}
      <View style={styles.downButtonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.downButton]}
          onPress={() => onPress('down')}
        >
          <Image
            source={require('../public/Images/down.png')}
            style={styles.buttonImage}
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
  button: {
    width: width * 0.07, // 使用屏幕宽度的 7% 作为按钮宽度
    height: width * 0.07, // 使用屏幕宽度的 7% 作为按钮高度
    borderRadius: width * 0.035, // 按钮为圆形，半径为宽度的一半
    backgroundColor: '#f5f5f5', // 按钮背景色
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, // 添加外边框宽度
    borderColor: '#000', // 外边框颜色
    borderStyle: 'solid', // 外边框样式（实线）
  },
  buttonImage: {
    width: width * 0.05, // 使用屏幕宽度的 5% 作为图片宽度
    height: width * 0.05, // 使用屏幕宽度的 5% 作为图片高度
    resizeMode: 'contain', // 保持图片比例
  },
  upButtonContainer: {
    position: 'absolute', // 使用绝对定位
    top: height * 0.66, // 距离顶部 40% 的高度
    left: width * 0.75, // 距离左侧 30% 的宽度
  },
  downButtonContainer: {
    position: 'absolute', // 使用绝对定位
    top: height * 0.84, // 距离顶部 50% 的高度
    right: width * 0.18, // 距离右侧 30% 的宽度
  },
});

export default DirectionPad;