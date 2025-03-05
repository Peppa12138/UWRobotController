import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
const {width, height} = Dimensions.get('window');
const FunctionKeys = () => {
  // 可以扩展为执行具体命令的函数
  const handleSkillButtonPress = command => {
    console.log(`Executing ${command}`);
    // 这里可以通过API调用或状态更新来执行相应的任务
  };

  return (
    <View style={styles.skillKeysContainer}>
      <TouchableOpacity
        style={[styles.skillButton, styles.skillButtonLeft]}
        onPress={() => handleSkillButtonPress('抓取')}>
        <ImageBackground
          source={require('../public/Images/layDown.png')}
          style={styles.buttonBackground}
          resizeMode="contain"></ImageBackground>
        <Text style={styles.buttonText}>抓取</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.skillButton, styles.skillButtonRight]}
        onPress={() => handleSkillButtonPress('放下')}>
        <ImageBackground
          source={require('../public/Images/grab.png')}
          style={styles.buttonBackgroundGrab}
          resizeMode="contain"></ImageBackground>
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
    width: 90,
    height: 90,
    backgroundColor: '#008CBA',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 45, // 圆形按钮
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  skillButtonLeft: {
    position: 'absolute',
    bottom: 5,
    right: 50, // 调整位置
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
  buttonBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 250,
    height: 250,
    bottom: 85,
    right: 15,
    zIndex: -1,
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
