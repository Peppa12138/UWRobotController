import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const FloatingButton = ({ onPress, text }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 120,            // 按钮宽度
    height: 40,            // 按钮高度
    backgroundColor: 'grey', // 按钮背景颜色
    borderRadius: 20,      // 按钮圆角
    justifyContent: 'center', // 文字居中
    alignItems: 'center',
    marginTop: 5,         // 距离顶部的距离
    marginLeft: 5,        // 距离左边的距离
    marginRight: 20,       // 距离右边的距离
    marginBottom: 35,      // 距离底部的距离
  },
  buttonText: {
    color: '#fff',         // 文字颜色
    fontSize: 16,          // 文字大小
  },
});

export default FloatingButton;