import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  Text,
} from 'react-native';

const App = () => {
  const {width, height} = Dimensions.get('window');

  return (
    <View style={styles.container}>
      {/* 背景图片 */}
      <StatusBar hidden={true} />
      <Image
        source={require('./bgi.jpg')} // 替换为实际的背景图片链接
        style={[styles.backgroundImage, {width, height}]}
        resizeMode="stretch"
      />

      {/* 中间的图片 */}
      <View style={styles.centerImageContainer}>
        <Image
          source={require('./character.png')} // 替换为实际的中间图片链接
          style={styles.centerImage}
          resizeMode="contain"
        />
      </View>

      {/* 右上角的图片 */}
      <View style={styles.topRightImageContainer}>
        <Image
          source={require('./signet.png')} // 替换为实际的右上角图片链接
          style={styles.topRightImage}
          resizeMode="contain"
        />
      </View>
      {/* 底部文字 */}
      <View style={styles.bottomTextContainer}>
        <Text style={styles.bottomText}>请先登录后进入</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerImageContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',

    transform: [{translateX: -295}, {translateY: -260}], // 根据图片大小调整中心位置
  },
  centerImage: {
    width: 590,
  },
  topRightImageContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: 290}, {translateY: -170}],
  },
  topRightImage: {
    width: 50, // 根据需求调整图片大小
    height: 66,
  },
  bottomTextContainer: {
    position: 'absolute',
    bottom: 67, // 距离底部 67dp
    alignItems: 'center', // 水平居中
  },
  bottomText: {
    fontSize: 21, // 字体大小
    color: 'white', // 字体颜色
  },
});

export default App;
