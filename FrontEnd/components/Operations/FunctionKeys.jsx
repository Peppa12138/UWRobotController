import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const FunctionKeys = () => {
  // 可以扩展为执行具体命令的函数
  const handleSkillButtonPress = command => {
    console.log(`Executing ${command}`);
    // 这里可以通过API调用或状态更新来执行相应的任务
  };

  return (
    <View style={styles.skillKeysContainer}>
      {/* 只保留“放下”键 */}
      <TouchableOpacity
        style={[styles.skillButton, styles.skillButtonRight]}
        onPress={() => handleSkillButtonPress('放下')}
      >
        <ImageBackground
          source={require('../public/Images/grab.png')}
          style={styles.buttonBackgroundGrab}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  skillKeysContainer: {
    position: 'absolute',
    bottom: height * 0.15, // 使用屏幕高度的百分比来定位
    right: width * 0.03, // 使用屏幕宽度的百分比来定位
    flexDirection: 'row',
  },
  skillButton: {
    width: 70, // 保留原来的按钮大小
    height: 70, // 保留原来的按钮大小
    backgroundColor: '#008CBA',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 45, // 圆形按钮
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  skillButtonRight: {
    position: 'absolute',
    bottom: height * 0.15, // 使用屏幕高度的百分比来调整位置
    right: -width * 0.07, // 使用屏幕宽度的百分比来调整位置
  },
  buttonText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 22,
    bottom: 25,
    fontWeight: 'bold',
  },
  buttonBackgroundGrab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 120, // 保留原来的背景图大小
    height: 120, // 保留原来的背景图大小
    bottom: 25, // 保留图片在按钮中的相对位置
    right: 15, // 保留图片在按钮中的相对位置
    zIndex: -1, // 保留原来的层级
  },
});

export default FunctionKeys;