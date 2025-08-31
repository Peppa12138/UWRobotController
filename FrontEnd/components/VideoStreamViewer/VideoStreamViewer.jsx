import React, {useState, useEffect, useRef} from 'react';
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
  const [currentFrame, setCurrentFrame] = useState(null);
  const [frameCount, setFrameCount] = useState(0);
  const [lastFrameTime, setLastFrameTime] = useState(0);
  const [frameRate, setFrameRate] = useState(0);
  const canvasRef = useRef(null);

  // 添加帧缓冲相关的 refs 和状态
  const frameBufferRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  const frameUpdateIntervalRef = useRef(null);
  const [displayFrame, setDisplayFrame] = useState(null);
  const frameQueueRef = useRef([]);
  const isUpdatingRef = useRef(false);

  // 优化帧更新间隔 - 提高到25 FPS 获得更好的平衡
  const FRAME_UPDATE_INTERVAL = 40; // 25FPS，在流畅度和稳定性间平衡
  const MAX_FRAME_QUEUE_SIZE = 2; // 减少缓冲队列，降低延迟

  /**
   * 更新显示帧的函数 - 防止并发更新，添加预加载机制
   */
  const updateDisplayFrame = frameData => {
    if (isUpdatingRef.current) {
      return;
    }

    isUpdatingRef.current = true;

    // 预加载下一帧（如果队列中有的话）
    const nextFrameData =
      frameQueueRef.current.length > 0
        ? frameQueueRef.current[frameQueueRef.current.length - 1].data
        : null;

    if (nextFrameData && nextFrameData !== frameData) {
      // 预加载下一帧到内存（通过创建Image对象）
      const preloadImage = new Image();
      preloadImage.src = `data:image/jpeg;base64,${nextFrameData}`;
    }

    setDisplayFrame(frameData);
    lastUpdateTimeRef.current = Date.now();

    // 使用更短的延迟来允许更频繁的更新
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 8); // 8ms 约 120fps的间隔，但实际受限于FRAME_UPDATE_INTERVAL

    console.log(
      'VideoStreamViewer: 显示帧已更新，预加载状态:',
      !!nextFrameData,
    );
  };

  // 移除网络配置相关代码
  // const networkConfig = getAppConfig('DEVELOPMENT');

  useEffect(() => {
    console.log('[VideoStreamViewer] 组件初始化');

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
        setCurrentFrame(null);
        break;
      case 'video_frame':
        handleVideoFrame(data);
        break;
      default:
        console.log('未处理的消息类型:', data.type);
    }
  };

  /**
   * 处理接收到的视频帧 - 使用智能帧缓冲机制减少闪动
   */
  const handleVideoFrame = data => {
    const {frameData, timestamp, frameNumber} = data;

    console.log('VideoStreamViewer: 收到视频帧:', {
      frameNumber,
      timestamp,
      frameDataLength: frameData ? frameData.length : 0,
    });

    // 更新帧信息
    setFrameCount(frameNumber);
    const currentTime = Date.now();
    setLastFrameTime(currentTime);

    // 验证和缓存当前帧
    if (frameData && frameData.length > 0) {
      try {
        // 清理base64数据，确保格式正确
        const cleanFrameData = frameData.replace(/\s/g, '');

        // 验证base64格式
        if (
          cleanFrameData.length % 4 === 0 &&
          /^[A-Za-z0-9+/]*={0,2}$/.test(cleanFrameData)
        ) {
          // 添加到帧队列
          frameQueueRef.current.push({
            data: cleanFrameData,
            timestamp: currentTime,
            frameNumber: frameNumber,
          });

          // 保持队列大小
          if (frameQueueRef.current.length > MAX_FRAME_QUEUE_SIZE) {
            frameQueueRef.current.shift(); // 移除最老的帧
          }

          // 更新当前帧引用
          frameBufferRef.current = cleanFrameData;
          setCurrentFrame(cleanFrameData);

          // 智能更新显示帧 - 避免重复更新
          if (!isUpdatingRef.current) {
            const now = Date.now();
            const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

            if (timeSinceLastUpdate >= FRAME_UPDATE_INTERVAL) {
              // 立即更新
              updateDisplayFrame(cleanFrameData);
            } else {
              // 延迟更新以保持稳定的帧率
              setTimeout(() => {
                if (frameBufferRef.current && !isUpdatingRef.current) {
                  updateDisplayFrame(frameBufferRef.current);
                }
              }, FRAME_UPDATE_INTERVAL - timeSinceLastUpdate);
            }
          }

          setIsStreaming(true);
          console.log(
            'VideoStreamViewer: 帧已加入队列 - 队列大小:',
            frameQueueRef.current.length,
          );

          // 计算实际帧率
          if (frameNumber > 1) {
            const timeDiff = currentTime - (timestamp || currentTime);
            const fps = timeDiff > 0 ? Math.min(30, 1000 / timeDiff) : 30;
            setFrameRate(fps);
          }

          console.log(
            'VideoStreamViewer: 设置视频帧成功，长度:',
            cleanFrameData.length,
          );
        } else {
          console.error('VideoStreamViewer: 无效的base64数据格式');
          console.log('数据样本:', cleanFrameData.substring(0, 100));
        }
      } catch (error) {
        console.error('VideoStreamViewer: 处理视频帧数据时出错:', error);
      }
    } else {
      console.warn('VideoStreamViewer: 接收到空的视频帧数据');
    }

    // 通知父组件统计信息更新
    if (onStatsUpdate) {
      const fps =
        frameNumber > 1 ? Math.round(1000 / (currentTime - lastFrameTime)) : 0;
      onStatsUpdate({
        fps: fps,
        frameNumber: frameNumber,
        timestamp: timestamp,
        duration: currentTime - lastFrameTime,
      });
    }
  };

  /**
   * 组件卸载时的清理工作
   */
  useEffect(() => {
    return () => {
      // 清理定时器
      if (frameUpdateIntervalRef.current) {
        clearInterval(frameUpdateIntervalRef.current);
        frameUpdateIntervalRef.current = null;
      }

      // 清理WebSocket连接
      if (wsConnection) {
        wsConnection.close();
      }

      console.log('VideoStreamViewer: 组件清理完成');
    };
  }, [wsConnection]);

  /**
   * 发送摄像头控制命令
   */
  const sendCameraControl = (command, parameters = {}) => {
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
  };

  /**
   * 获取连接状态颜色
   */
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      default:
        return '#FFC107';
    }
  };

  /**
   * 获取连接状态文本
   */
  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return '已连接';
      case 'error':
        return '连接错误';
      default:
        return '连接中...';
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* 视频显示区域 */}
      <View style={styles.videoContainer}>
        {/* 调试信息显示 */}
        <Text style={styles.debugText}>
          连接状态: {connectionStatus}
          {'\n'}是否流媒体: {isStreaming ? '是' : '否'}
          {'\n'}帧率: {frameRate.toFixed(1)} fps
          {'\n'}帧计数: {frameCount}
          {'\n'}缓存帧:{' '}
          {currentFrame ? `${(currentFrame.length / 1024).toFixed(1)}KB` : '无'}
          {'\n'}显示帧:{' '}
          {displayFrame ? `${(displayFrame.length / 1024).toFixed(1)}KB` : '无'}
          {'\n'}最后一帧时间:{' '}
          {lastFrameTime ? new Date(lastFrameTime).toLocaleTimeString() : '无'}
          {'\n'}更新间隔: {FRAME_UPDATE_INTERVAL}ms
        </Text>

        {displayFrame ? (
          <View style={styles.videoDisplayContainer}>
            <Text style={styles.videoDebugText}>
              视频流正常 - 帧大小: {displayFrame.length} bytes
            </Text>

            {/* 双缓冲渲染减少闪动 */}
            <View style={styles.videoFrameContainer}>
              <FastImage
                key={`frame-${lastFrameTime}`} // 使用唯一key强制重新渲染
                source={{uri: `data:image/jpeg;base64,${displayFrame}`}}
                style={styles.mainVideoFrame}
                resizeMode="contain"
                priority={FastImage.priority.high}
                cache={FastImage.cacheControl.web}
                onLoad={() => {
                  console.log('VideoStreamViewer: 主视频帧加载成功');
                }}
                onError={error => {
                  console.error('VideoStreamViewer: 主视频帧加载失败:', error);
                }}
                onLoadStart={() => {
                  console.log('VideoStreamViewer: 开始加载新帧');
                }}
              />
            </View>

            {/* 简化的调试信息 */}
            <View style={styles.debugInfoContainer}>
              <Text style={styles.debugInfoText}>
                帧信息:{' '}
                {displayFrame
                  ? `${(displayFrame.length / 1024).toFixed(1)}KB`
                  : '无数据'}
                {'\n'}队列大小: {frameQueueRef.current.length}
              </Text>
            </View>
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

        {/* 状态栏 */}
        <View style={styles.statusOverlay}>
          <View style={styles.statusBar}>
            <View
              style={[
                styles.statusIndicator,
                {backgroundColor: getConnectionStatusColor()},
              ]}
            />
            <Text style={styles.statusText}>{getConnectionStatusText()}</Text>
            {isStreaming && <Text style={styles.streamingText}>● LIVE</Text>}
          </View>

          {/* 视频信息 */}
          {isStreaming && (
            <View style={styles.videoInfo}>
              <Text style={styles.infoText}>帧数: {frameCount}</Text>
              <Text style={styles.infoText}>
                延迟: {Date.now() - lastFrameTime}ms
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 控制按钮 */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => sendCameraControl('take_photo')}>
          <Image
            source={require('../public/Images/catch.png')}
            style={styles.controlIcon}
          />
          <Text style={styles.controlText}>拍照</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() =>
            sendCameraControl(
              isStreaming ? 'stop_streaming' : 'start_streaming',
            )
          }>
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
          onPress={() => connectToVideoStream()}>
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
  videoFrame: {
    width: '100%',
    height: '100%',
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
    top: 0,
    left: 0,
    right: 0,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    flex: 1,
  },
  streamingText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: 'bold',
  },
  videoDisplayContainer: {
    flex: 1,
    backgroundColor: '#000', // 黑色背景减少视觉干扰
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDebugText: {
    color: 'white',
    fontSize: 14,
    padding: 8,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'absolute',
    top: 40, // 避免与状态栏重叠
    left: 10,
    right: 10,
    zIndex: 1,
  },
  mainVideoFrame: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent', // 透明背景
  },
  videoFrameContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000', // 确保黑色背景
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugInfoContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 5,
    padding: 8,
  },
  debugInfoText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  videoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  infoText: {
    color: 'white',
    fontSize: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  controlButton: {
    alignItems: 'center',
    minWidth: 60,
  },
  controlIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
    tintColor: 'white',
  },
  controlText: {
    color: 'white',
    fontSize: 10,
  },
  debugText: {
    position: 'absolute',
    top: 100,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    fontSize: 12,
    padding: 10,
    zIndex: 1000,
  },
});

export default VideoStreamViewer;
