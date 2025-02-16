import React from 'react';
import { TouchableOpacity, View, StyleSheet, Image } from 'react-native';

const DirectionPad = ({ onPress }) => {
  return (
    <View style={styles.directionPad}>
      {/* 上按钮 */}
      <TouchableOpacity
        style={[styles.button, styles.upButton]}
        onPress={() => onPress('up')}
      >
        <Image
          source={require('../public/Images/up.png')}
          style={styles.buttonImage}
        />
      </TouchableOpacity>

      {/* 中间行（左和右按钮） */}
      <View style={styles.middleRow}>
        <TouchableOpacity
          style={[styles.button, styles.leftButton]}
          onPress={() => onPress('left')}
        >
          <Image
            source={require('../public/Images/left.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.rightButton]}
          onPress={() => onPress('right')}
        >
          <Image
            source={require('../public/Images/right.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      </View>

      {/* 下按钮 */}
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
  );
};

const styles = StyleSheet.create({
  directionPad: {
    alignItems: 'center',
    marginTop: -150, // 将整个方向键往上移动
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30, // 按钮为圆形
    backgroundColor: '#f5f5f5', // 按钮背景色
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0, // 缩小按键之间的距离
    borderWidth: 2, // 添加外边框宽度
    borderColor: '#000', // 外边框颜色
    borderStyle: 'solid', // 外边框样式（实线）
  },
  buttonImage: {
    width: 40, // 图片宽度
    height: 40, // 图片高度
    resizeMode: 'contain', // 保持图片比例
  },
  upButton: {
    alignSelf: 'center',
    marginBottom: 0, // 将上按键往下移
  },
  downButton: {
    alignSelf: 'center',
    marginTop: 0, // 将下按键往上移
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'center', // 确保左右按钮水平居中
  },
  leftButton: {
    marginRight: 30, // 增加右边距，使左键往左移动
  },
  rightButton: {
    marginLeft: 30, // 增加左边距，使右键往右移动
  },
});

export default DirectionPad;