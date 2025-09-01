import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import IPDetector from '../../utils/IPDetector';

const {width, height} = Dimensions.get('window');

// 使用动态IP检测的网络配置
const getWebSocketUrl = () => {
  const dynamicIP = IPDetector.getCurrentIP();
  const websocketURL = IPDetector.getWebSocketURL();

  console.log('[VideoStreamViewer] 使用动态IP配置:', {
    detectedIP: dynamicIP,
    websocketURL: websocketURL,
  });

  return websocketURL;
};

const VideoStreamViewer = ({
  style,
  onCameraControl,
  onConnectionChange,
  onStatsUpdate,
}) => {
  const [wsConnection, setWsConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isStreaming, setIsStreaming] = useState(false);
  const [displayFrame, setDisplayFrame] = useState(null);
  
  // 极简状态管理 - 只保留最基本的统计
  const frameStatsRef = useRef({
    frameCount: 0,
    lastFrameTime: 0
  });
  
  // 简化的帧率控制 - 固定15FPS减少Bridge压力
  const lastUpdateTimeRef = useRef(0);
  const FRAME_UPDATE_INTERVAL = 67; // 15FPS，大幅减少Bridge开销

  /**
   * 极简帧更新函数 - 移除所有复杂逻辑
   */
  const updateDisplayFrame = frameData => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    
    // 简单的时间间隔控制
    if (timeSinceLastUpdate >= FRAME_UPDATE_INTERVAL) {
      setDisplayFrame(frameData);
      lastUpdateTimeRef.current = now;
    }
  };

  useEffect(() => {
    console.log('[VideoStreamViewer] 组件初始化 - 极简模式');

    // 输出网络配置信息
    IPDetector.logNetworkInfo();

    // 连接到视频流
    connectToVideoStream();

    // 添加IP变化监听器
    const handleIPChange = (newIP, oldIP) => {
      console.log(`[VideoStreamViewer] 检测到IP变化: ${oldIP} -> ${newIP}`);
      Alert.alert(
        '网络变化',
        `检测到IP地址变化，将重新连接服务器\n新IP: ${newIP}`,
        [
          {
            text: '重新连接',
            onPress: () => {
              // 断开当前连接
              if (wsConnection) {
                wsConnection.close();
              }
              // 重新连接
              setTimeout(connectToVideoStream, 1000);
            },
          },
        ],
      );
    };

    IPDetector.addIPChangeListener(handleIPChange);

    return () => {
      // 清理IP监听器
      IPDetector.removeIPChangeListener(handleIPChange);

      // 清理WebSocket连接
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, []);

  /**
   * 连接到视频流WebSocket服务器
   */
  const connectToVideoStream = () => {
    try {
      // 使用内部配置的WebSocket地址
      const wsUrl = getWebSocketUrl();
      console.log('正在连接到视频流服务器:', wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('视频观看者WebSocket连接已建立');
        setConnectionStatus('connected');

        // 通知父组件连接状态变化
        if (onConnectionChange) {
          onConnectionChange(true);
        }

        // 注册为观看者
        ws.send(
          JSON.stringify({
            type: 'join_as_viewer',
          }),
        );
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('解析WebSocket消息失败:', error);
        }
      };

      ws.onerror = error => {
        console.error('WebSocket错误:', error);
        setConnectionStatus('error');
      };

      ws.onclose = () => {
        console.log('WebSocket连接已关闭');
        setConnectionStatus('disconnected');
        setIsStreaming(false);

        // 通知父组件连接状态变化
        if (onConnectionChange) {
          onConnectionChange(false);
        }

        // 尝试重连
        setTimeout(() => {
          if (!wsConnection || wsConnection.readyState === WebSocket.CLOSED) {
            connectToVideoStream();
          }
        }, 3000);
      };

      setWsConnection(ws);
    } catch (error) {
      console.error('创建WebSocket连接失败:', error);
      setConnectionStatus('error');
    }
  };

  /**
   * 处理WebSocket消息
   */
  const handleWebSocketMessage = data => {
    switch (data.type) {
      case 'welcome':
        console.log('收到欢迎消息:', data.message);
        break;
      case 'viewer_joined':
        console.log('成功加入为观看者');
        setIsStreaming(data.isStreaming);
        break;
      case 'stream_started':
        console.log('视频流开始:', data.streamInfo);
        setIsStreaming(true);
        break;
      case 'stream_stopped':
        console.log('视频流停止');
        setIsStreaming(false);
        setDisplayFrame(null);
        break;
      case 'video_frame':
        handleVideoFrame(data);
        break;
      default:
        console.log('未处理的消息类型:', data.type);
    }
  };

  /**
   * 极简帧处理 - 移除所有复杂逻辑，专注流畅性
   */
  const handleVideoFrame = data => {
    const {frameData, frameNumber} = data;

    // 基本验证
    if (!frameData || frameData.length < 5000) {
      return;
    }

    try {
      // 最简处理：直接trim
      const cleanFrameData = frameData.trim();
      
      // 直接更新显示帧，不做异步处理
      updateDisplayFrame(cleanFrameData);

      // 更新基本统计
      frameStatsRef.current.frameCount = frameNumber;
      frameStatsRef.current.lastFrameTime = Date.now();

      // 只在流状态变化时更新UI状态
      if (!isStreaming) {
        setIsStreaming(true);
      }

      // 极少量日志（每500帧一次）
      if (frameNumber % 500 === 0) {
        console.log(`VideoStreamViewer: 极简模式处理第${frameNumber}帧`);
      }

    } catch (error) {
      console.error('VideoStreamViewer: 帧处理出错:', error);
    }

    // 降低统计回调频率
    if (onStatsUpdate && frameNumber % 50 === 0) {
      onStatsUpdate({
        frameNumber: frameNumber,
        timestamp: Date.now(),
        mode: 'simplified'
      });
    }
  };

  /**
   * 极简组件清理
   */
  useEffect(() => {
    return () => {
      console.log('VideoStreamViewer: 极简模式清理');
      
      // 清理WebSocket连接
      if (wsConnection) {
        wsConnection.close();
      }
      
      // 简单清理
      setDisplayFrame(null);
      setIsStreaming(false);
    };
  }, [wsConnection]);

  /**
   * 使用useCallback缓存函数，避免重复创建
   */
  const sendCameraControl = useCallback((command, parameters = {}) => {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(
        JSON.stringify({
          type: 'camera_control',
          command: command,
          parameters: parameters,
        }),
      );

      // 回调通知父组件
      if (onCameraControl) {
        onCameraControl(command, parameters);
      }
    } else {
      Alert.alert('连接错误', '无法发送控制命令，请检查连接状态');
    }
  }, [wsConnection, onCameraControl]);

  /**
   * 缓存状态相关的计算结果
   */
  const connectionStatusColor = useMemo(() => {
    switch (connectionStatus) {
      case 'connected':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      default:
        return '#FFC107';
    }
  }, [connectionStatus]);

  const connectionStatusText = useMemo(() => {
    switch (connectionStatus) {
      case 'connected':
        return '已连接';
      case 'error':
        return '连接错误';
      default:
        return '连接中...';
    }
  }, [connectionStatus]);

  /**
   * 缓存视频源URI，减少重复计算
   */
  const videoSource = useMemo(() => {
    return displayFrame ? {uri: `data:image/jpeg;base64,${displayFrame}`} : null;
  }, [displayFrame]);

  /**
   * 缓存按钮点击事件
   */
  const handleTakePhoto = useCallback(() => {
    sendCameraControl('take_photo');
  }, [sendCameraControl]);

  const handleToggleStream = useCallback(() => {
    sendCameraControl(isStreaming ? 'stop_streaming' : 'start_streaming');
  }, [sendCameraControl, isStreaming]);

  const handleReconnect = useCallback(() => {
    connectToVideoStream();
  }, []);

  return (
    <View style={[styles.container, style]}>
      {/* 视频显示区域 */}
      <View style={styles.videoContainer}>
        {displayFrame && videoSource ? (
          <View style={styles.videoDisplayContainer}>
            {/* 极简视频帧渲染 - 最基本配置 */}
            <FastImage
              source={videoSource}
              style={styles.mainVideoFrame}
              resizeMode="cover"
              priority={FastImage.priority.high}
              cache={FastImage.cacheControl.immutable}
            />
          </View>
        ) : (
          <View style={styles.noVideoContainer}>
            <Image
              source={require('../public/Images/no_signal.png')}
              style={styles.noSignalIcon}
            />
            <Text style={styles.noVideoText}>
              {isStreaming ? '等待视频帧...' : '无视频信号'}
            </Text>
          </View>
        )}

        {/* 简化的状态栏 */}
        <View style={styles.statusOverlay}>
          <View style={styles.statusBar}>
            <View
              style={[
                styles.statusIndicator,
                {backgroundColor: connectionStatusColor},
              ]}
            />
            <Text style={styles.statusText}>{connectionStatusText}</Text>
            {isStreaming && <Text style={styles.streamingText}>● LIVE</Text>}
          </View>
        </View>
      </View>

      {/* 控制按钮 */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleTakePhoto}>
          <Image
            source={require('../public/Images/catch.png')}
            style={styles.controlIcon}
          />
          <Text style={styles.controlText}>拍照</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleToggleStream}>
          <Image
            source={require('../public/Images/wave.png')}
            style={styles.controlIcon}
          />
          <Text style={styles.controlText}>
            {isStreaming ? '停止' : '开始'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleReconnect}>
          <Image
            source={require('../public/Images/wifi.png')}
            style={styles.controlIcon}
          />
          <Text style={styles.controlText}>重连</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  videoDisplayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  mainVideoFrame: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'transparent',
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  noSignalIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
    tintColor: '#666',
  },
  noVideoText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  statusOverlay: {
    position: 'absolute',
    top: 30,
    left: 15,
    right: 15,
    zIndex: 100,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.5,
  },
  streamingText: {
    color: '#FF4444',
    fontSize: 13,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'center',
    minWidth: 50,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 100,
  },
  controlButton: {
    alignItems: 'center',
    minWidth: 70,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  controlIcon: {
    width: 28,
    height: 28,
    marginBottom: 6,
    tintColor: 'white',
  },
  controlText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default VideoStreamViewer;
