import React, {useState} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Video from 'react-native-video';

// 获取屏幕宽度和高度
const {width, height} = Dimensions.get('window');

const VideoStats = () => {
  const [progress, setProgress] = useState(0); // 当前播放进度
  const [frameRate, setFrameRate] = useState(null); // 帧率

  const handleProgress = data => {
    setProgress(data.currentTime); // 当前播放时间
  };

  const handleLoad = data => {
    // 获取视频的总时长和帧率
    setFrameRate(data.naturalSize.width / data.naturalSize.height); // 示例：按宽高比例来估算帧率（实际帧率需要从视频元数据获取）
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Progress: {Math.floor(progress)}s</Text>
      <Text style={styles.text}>
        Frame Rate: {frameRate ? frameRate : 'Calculating...'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: height * 0.3, // 设置为屏幕高度的10%
    right: width * 0.02, // 使其水平居中，减去大约一半的宽度 (200px 是假定的容器宽度)
    zIndex: 10, // 确保它不会被其他元素遮挡
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // 设置背景颜色
    padding: 10,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
});

export default VideoStats;
