import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Video from 'react-native-video';

const VideoStats = () => {
  const [progress, setProgress] = useState(0); // 当前播放进度
  const [frameRate, setFrameRate] = useState(null); // 帧率

  const handleProgress = (data) => {
    setProgress(data.currentTime); // 当前播放时间
  };

  const handleLoad = (data) => {
    // 获取视频的总时长和帧率
    setFrameRate(data.naturalSize.width / data.naturalSize.height); // 示例：按宽高比例来估算帧率（实际帧率需要从视频元数据获取）
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Progress: {Math.floor(progress)}s</Text>
      <Text style={styles.text}>Frame Rate: {frameRate ? frameRate : 'Calculating...'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 230,  // 距离底部20px
    left: 700,    // 距离左侧20px
    zIndex: 10,  // 确保它不会被其他元素遮挡
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
