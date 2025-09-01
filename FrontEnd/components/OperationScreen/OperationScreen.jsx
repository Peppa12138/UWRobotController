import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
//  移除 Video 导入
// import Video from 'react-native-video';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import axios from 'axios';

// 导入 VideoStreamViewer (WebView版本 - 避免频闪)
import VideoStreamViewer from '../VideoStreamViewer/VideoStreamViewer';

import FunctionKeys from '../Operations/FunctionKeys';
import StatusView from '../Operations/StatusView';
import VirtualJoystick from '../VirtualJoystick/VirtualJoystick';
import ReturnButton from '../Operations/ReturnButton';
import NetworkStatus from '../Operations/NetworkStatus';
import VideoStats from '../Operations/VideoStats';
import DirectionPad from '../Operations/DirectionPad';

const {width, height} = Dimensions.get('window');

const ControlPanel = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [fontSize, setFontSize] = useState(route.params?.fontSize || 14);
  const [controlMode, setControlMode] = useState(
    route.params?.controlMode || 1,
  );
  const [statusData, setStatusData] = useState({});
  const [activeTouchId, setActiveTouchId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // // 新增用于视频播放数据的 state
  // const [videoProgress, setVideoProgress] = useState(0);
  // const [videoFrameRate, setVideoFrameRate] = useState(null);

  // 修改为视频流相关的 state
  const [streamProgress, setStreamProgress] = useState(0);
  const [streamFrameRate, setStreamFrameRate] = useState(30); // 默认30fps
  const [isStreamConnected, setIsStreamConnected] = useState(false);

  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        const response = await axios.get('http://10.0.2.2:5000/api/status');
        setStatusData(response.data);
      } catch (error) {
        console.error('获取状态数据失败:', error);
      }
    };

    const intervalId = setInterval(fetchStatusData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.fontSize) {
        setFontSize(route.params.fontSize);
      }
      if (route.params?.controlMode !== undefined) {
        setControlMode(route.params.controlMode);
      }
    }, [route.params?.fontSize, route.params?.controlMode]),
  );

  const handleDirectionPress = direction => {
    console.log(`Pressed ${direction} button`);
  };

  const handleTouchStart = e => {
    const touchId = e.nativeEvent.touchId;
    setActiveTouchId(touchId);
  };

  const handleTouchMove = (e, gestureState) => {
    if (activeTouchId && e.nativeEvent.touchId === activeTouchId) {
      const joystickElement = e.target;
      joystickElement.measure((x, y, width, height, pageX, pageY) => {
        const offsetX = gestureState.moveX - pageX;
        const offsetY = gestureState.moveY - pageY;
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

        const maxDistance = width / 2;
        if (distance <= maxDistance) {
          // Update joystick position here
        }
      });
    }
  };

  const handleTouchEnd = e => {
    if (e.nativeEvent.touchId === activeTouchId) {
      setActiveTouchId(null);
    }
  };

  const toggleMute = () => {
    setIsMuted(prevState => !prevState);
  };

  const handleReturnButtonPress = () => {
    setIsPaused(true);
    navigation.navigate('AfterLogin');
  };

  // // 新增：处理视频进度更新
  // const handleVideoProgress = data => {
  //   setVideoProgress(data.currentTime);
  // };

  // // 新增：处理视频加载完成事件
  // const handleVideoLoad = data => {
  //   // 此处仅示例如何计算帧率（不是真正的帧率）
  //   setVideoFrameRate(data.naturalSize.width / data.naturalSize.height);
  // };

  // 处理视频流连接状态
  const handleStreamConnectionChange = connected => {
    setIsStreamConnected(connected);
  };

  // 处理视频流统计数据 - 包含性能监控
  const handleStreamStats = stats => {
    setStreamFrameRate(stats.fps || 30);
    setStreamProgress(stats.duration || 0);
    
    // 新增：显示性能监控信息
    if (stats.performance) {
      console.log('WebView性能监控:', {
        avgRenderTime: stats.performance.avgRenderTime + 'ms',
        droppedFrames: stats.performance.droppedFrames,
        bufferSize: stats.performance.bufferSize
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* <Video
        source={require('../public/Videos/background.mp4')}
        style={StyleSheet.absoluteFill}
        muted={isMuted}
        paused={isPaused}
        repeat={true}
        resizeMode="cover"
        onLoad={handleVideoLoad} // 添加 onLoad 事件
        onProgress={handleVideoProgress} // 添加 onProgress 事件
      /> */}
      <View style={styles.container}>
        {/* 替换 Video 组件为 VideoStreamViewer */}
        <VideoStreamViewer
          style={StyleSheet.absoluteFill}
          onConnectionChange={handleStreamConnectionChange}
          onStatsUpdate={handleStreamStats}
        />
        <View style={styles.content}>
          <View style={styles.leftPanel}>
            {controlMode === 1 && (
              <VirtualJoystick
                // onMove={data => console.log(data)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            )}
          </View>
          <View style={styles.rightPanel}>
            <FunctionKeys />
          </View>
          <DirectionPad onPress={handleDirectionPress} />
          <ReturnButton onPress={handleReturnButtonPress} />
          <View style={styles.statusViewContainer}>
            <StatusView fontSize={fontSize} statusData={statusData} />
          </View>
        </View>

        <NetworkStatus />
        {/* 将视频数据传递给 VideoStats 组件 */}
        {/* <VideoStats progress={videoProgress} frameRate={videoFrameRate} /> */}
        {/* 传递视频流数据给 VideoStats 组件 */}
        <VideoStats
          progress={streamProgress}
          frameRate={streamFrameRate}
          isLive={isStreamConnected}
        />

        {/* 添加流连接状态指示器 */}
        {/* <View style={styles.streamStatus}>
          <View
            style={[
              styles.statusIndicator,
              {backgroundColor: isStreamConnected ? '#00ff00' : '#ff0000'},
            ]}
          />
        </View>*/}
        {/* <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
        <Image
          source={
            isMuted
              ? require('../public/Images/mute_icon.png')
              : require('../public/Images/unmute_icon.png')
          }
          style={styles.muteIcon}
        />
      </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  leftPanel: {
    position: 'absolute',
    bottom: height * 0.05,
    left: width * 0.1,
  },
  rightPanel: {
    position: 'absolute',
    bottom: height * 0.05,
    right: width * 0.1,
  },
  statusViewContainer: {
    position: 'absolute',
    top: height * 0.11,
    left: width * 0.01,
    zIndex: 10,
  },
  muteButton: {
    position: 'absolute',
    top: height * 0.002,
    right: width * 0.09,
    zIndex: 10,
    padding: 10,
    width: width * 0.01,
    height: width * 0.1,
    borderRadius: (width * 0.12) / 2,
  },
  muteIcon: {
    width: width * 0.03,
    height: width * 0.03,
  },
  // 新增：流状态指示器
  streamStatus: {
    position: 'absolute',
    top: height * 0.02,
    right: width * 0.1,
    zIndex: 15,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});

export default ControlPanel;
