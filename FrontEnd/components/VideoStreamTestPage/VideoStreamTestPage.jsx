import React from 'react';
import {View, Text, StyleSheet, SafeAreaView, StatusBar} from 'react-native';
import VideoStreamViewer from '../VideoStreamViewer/VideoStreamViewer';

/**
 * 视频流测试页面
 * 专门用于测试视频流功能
 */
const VideoStreamTestPage = () => {
  const handleCameraControl = (command, parameters) => {
    console.log('摄像头控制命令:', command, parameters);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* 标题栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📹 视频流测试</Text>
        <Text style={styles.headerSubtitle}>实时摄像头画面传输</Text>
      </View>

      {/* 视频流组件 */}
      <View style={styles.videoContainer}>
        <VideoStreamViewer
          style={styles.videoViewer}
          onCameraControl={handleCameraControl}
        />
      </View>

      {/* 底部信息 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>🔗 确保电脑和手机在同一网络下</Text>
        <Text style={styles.footerText}>🎥 在电脑端启动摄像头推流器</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  videoContainer: {
    flex: 1,
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  videoViewer: {
    flex: 1,
  },
  footer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 2,
  },
});

export default VideoStreamTestPage;
