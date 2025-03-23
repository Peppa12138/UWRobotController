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
        <Text style={styles.buttonText}>放下</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  skillKeysContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
  },
  skillButton: {
    width: 70,
    height: 70,
    backgroundColor: '#008CBA',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 45, // 圆形按钮
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  skillButtonRight: {
    position: 'absolute',
    bottom: 100,
    right: -50, // 调整位置
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
    width: 120,
    height: 120,
    bottom: 25,
    right: 15,
    zIndex: -1,
  },
});

export default FunctionKeys;