import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {Icon} from '@ant-design/react-native';

const ReturnButton = ({onPress}) => {
  const handlePress = () => {
    console.log('ReturnButton 被点击');
    if (onPress) {
      onPress();
    } else {
      console.log('onPress 函数未定义');
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.returnButton}>
      <Icon name="poweroff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  returnButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // 半透明背景
    borderRadius: 25,
    zIndex: 25, // 确保在调试指示器之上
  },
});

export default ReturnButton;
