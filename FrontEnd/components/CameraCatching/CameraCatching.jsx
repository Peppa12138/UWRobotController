// CameraCatching.jsx
import React, {useState, useRef, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';

const CameraCatching = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const camera = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back;

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const cameraPermission = await Camera.requestCameraPermission();
      const microphonePermission = await Camera.requestMicrophonePermission();

      console.log('Camera permission:', cameraPermission);
      console.log('Microphone permission:', microphonePermission);

      setHasPermission(
        cameraPermission === 'authorized' &&
          microphonePermission === 'authorized',
      );
    } catch (error) {
      console.error('Error checking permissions:', error);
      setHasPermission(false);
    }
  };

  // 如果没有权限，显示提示
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>需要相机和麦克风权限</Text>
        <TouchableOpacity style={styles.button} onPress={checkPermissions}>
          <Text style={styles.buttonText}>请求权限</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 如果相机设备未准备好，显示加载状态
  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>加载相机中...</Text>
      </View>
    );
  }

  const startStreaming = async () => {
    if (camera.current) {
      setIsStreaming(true);
      try {
        const ws = new WebSocket('ws://your-server-ip:3000');

        ws.onopen = () => {
          console.log('WebSocket Connected');
        };

        ws.onerror = error => {
          console.error('WebSocket Error:', error);
        };

        await camera.current.startRecording({
          onRecordingFinished: video => {
            console.log('Video recorded:', video);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(video.path);
            }
          },
          onRecordingError: error => {
            console.error('Recording error:', error);
            setIsStreaming(false);
          },
        });
      } catch (error) {
        console.error('Streaming Error:', error);
        setIsStreaming(false);
      }
    }
  };

  const stopStreaming = async () => {
    if (camera.current && isStreaming) {
      try {
        await camera.current.stopRecording();
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
      setIsStreaming(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          video={true}
          audio={true}
        />
        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.button,
              isStreaming ? styles.stopButton : styles.startButton,
            ]}
            onPress={isStreaming ? stopStreaming : startStreaming}>
            <Text style={styles.buttonText}>
              {isStreaming ? '停止直播' : '开始直播'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: 120,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default CameraCatching;
