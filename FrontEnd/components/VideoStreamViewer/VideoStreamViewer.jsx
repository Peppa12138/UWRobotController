import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Animated,
  Easing,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import {WebView} from 'react-native-webview';
import IPDetector from '../../utils/IPDetector';
import RNFS from 'react-native-fs';

const VideoStreamViewer = ({
  style,
  onCameraControl,
  onConnectionChange,
  onStatsUpdate,
}) => {
  const [wsConnection, setWsConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const webViewRef = useRef(null);

  // 抽屉动画相关
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(0)).current;

  // 改进的权限请求函数
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const androidVersion = Platform.constants['Release'];
      console.log('Android 版本:', androidVersion);

      if (androidVersion >= 13) {
        // Android 13+ 使用新的媒体权限
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        ];

        const results = await PermissionsAndroid.requestMultiple(permissions);
        const allGranted = Object.values(results).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED,
        );

        console.log('Android 13+ 权限结果:', results);
        return allGranted;
      } else if (androidVersion >= 11) {
        // Android 11-12 尝试获取管理所有文件权限
        const permissions = [
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ];

        const results = await PermissionsAndroid.requestMultiple(permissions);
        const basicGranted = Object.values(results).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED,
        );

        console.log('Android 11-12 基础权限结果:', results);

        // 如果基础权限被拒绝，尝试请求管理所有文件权限
        if (!basicGranted) {
          try {
            const managePermission = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE,
              {
                title: '文件管理权限',
                message: '需要文件管理权限来保存录制的视频到可访问的位置',
                buttonNeutral: '稍后询问',
                buttonNegative: '取消',
                buttonPositive: '确定',
              },
            );
            return managePermission === PermissionsAndroid.RESULTS.GRANTED;
          } catch (error) {
            console.log('管理存储权限请求失败:', error);
            return basicGranted;
          }
        }

        return basicGranted;
      } else {
        // Android 10 及以下
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: '存储权限',
            message: '应用需要存储权限来保存录制的视频文件',
            buttonNeutral: '稍后询问',
            buttonNegative: '取消',
            buttonPositive: '确定',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.error('权限请求失败:', err);
      return false;
    }
  };

  // 获取可访问的保存路径
  const getSavePath = async () => {
    if (Platform.OS === 'android') {
      try {
        const androidVersion = Platform.constants['Release'];

        // 尝试不同的公共目录路径
        const possiblePaths = [
          // 外部存储的下载目录
          `${RNFS.ExternalStorageDirectoryPath}/Download/VideoRecordings`,
          // 外部存储的影片目录
          `${RNFS.ExternalStorageDirectoryPath}/Movies/VideoRecordings`,
          // DCIM目录（相机目录）
          `${RNFS.ExternalStorageDirectoryPath}/DCIM/VideoRecordings`,
          // 公共下载目录
          RNFS.DownloadDirectoryPath,
        ];

        for (const path of possiblePaths) {
          try {
            console.log('尝试路径:', path);

            // 检查父目录是否存在
            const parentDir = path.substring(0, path.lastIndexOf('/'));
            const parentExists = await RNFS.exists(parentDir);

            if (parentExists) {
              // 尝试创建或访问目录
              const dirExists = await RNFS.exists(path);
              if (!dirExists) {
                await RNFS.mkdir(path);
              }

              // 测试写入权限
              const testFile = `${path}/test_write.txt`;
              await RNFS.writeFile(testFile, 'test', 'utf8');
              await RNFS.unlink(testFile);

              console.log('成功的保存路径:', path);
              return path;
            }
          } catch (error) {
            console.log(`路径 ${path} 不可用:`, error.message);
            continue;
          }
        }

        // 如果所有公共路径都失败，使用应用可访问的目录
        console.log('使用备用路径: ExternalDirectoryPath');
        return RNFS.ExternalDirectoryPath || RNFS.DocumentDirectoryPath;
      } catch (error) {
        console.error('获取保存路径失败:', error);
        return RNFS.DocumentDirectoryPath;
      }
    } else {
      return RNFS.DocumentDirectoryPath;
    }
  };

  // 检查路径是否为用户可访问
  const isUserAccessiblePath = path => {
    const userAccessiblePaths = [
      '/storage/emulated/0/Download',
      '/storage/emulated/0/Movies',
      '/storage/emulated/0/DCIM',
      '/sdcard/Download',
      '/sdcard/Movies',
      '/sdcard/DCIM',
    ];

    return userAccessiblePaths.some(accessible => path.includes(accessible));
  };

  // WebView HTML内容保持不变...
  const webViewHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Video Stream Canvas</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                background:#e0f2ff; 
                overflow: hidden; 
                font-family: Arial, sans-serif;
            }
            #videoCanvas { 
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw; 
                height: 100vh; 
                object-fit: cover;
                background:#e0f2ff;
                z-index: 1;
            }
            #statusBar {
                position: fixed;
                top: 10px;
                left: 20px;
                right: 20px;
                padding: 10px 20px;
                height: 40px;
                font-size: 14px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                z-index: 1000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            #statusIndicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #FFC107;
                margin-right: 12px;
                box-shadow: 0 0 10px rgba(255, 193, 7, 0.8);
                animation: pulse 2s infinite;
            }
            #statusIndicator.connected { 
                background: #4CAF50; 
                box-shadow: 0 0 10px rgba(76, 175, 80, 0.8);
            }
            #statusIndicator.error { 
                background: #F44336; 
                box-shadow: 0 0 10px rgba(244, 67, 54, 0.8);
            }
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }
            #liveIndicator {
                background: linear-gradient(45deg, #FF4444, #FF6B6B);
                color: white;
                font-weight: bold;
                font-size: 12px;
                padding: 6px 12px;
                border-radius: 15px;
                display: none;
                box-shadow: 0 3px 8px rgba(244, 67, 54, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            #liveIndicator.show { 
                display: block; 
                animation: liveBlink 1.5s infinite;
            }
            #recordIndicator {
                background: linear-gradient(45deg, #FF0000, #FF4444);
                color: white;
                font-weight: bold;
                font-size: 12px;
                padding: 6px 12px;
                border-radius: 15px;
                display: none;
                box-shadow: 0 3px 8px rgba(255, 0, 0, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.2);
                margin-left: 10px;
            }
            #recordIndicator.recording { 
                display: block; 
                animation: recordBlink 1s infinite;
            }
            @keyframes liveBlink {
                0%, 50% { opacity: 1; transform: scale(1); }
                25% { transform: scale(1.05); }
                51%, 100% { opacity: 0.85; }
            }
            @keyframes recordBlink {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            #statusText {
                color: #fff;
                font-size: 18px;
                font-weight: bold;
                text-shadow:
                  -1px -1px 0 #000,
                   1px -1px 0 #000,
                  -1px  1px 0 #000,
                   1px  1px 0 #000;
                letter-spacing: 1px;
            }
        </style>
    </head>
    <body>
        <canvas id="videoCanvas"></canvas>
        <div id="statusBar">
            <div style="display: flex; align-items: center;">
                <div id="statusIndicator"></div>
                <span id="statusText">连接中...</span>
            </div>
            <div style="display: flex; align-items: center;">
                <div id="liveIndicator">● LIVE</div>
                <div id="recordIndicator">● REC</div>
            </div>
        </div>

        <script>
            class CanvasVideoStream {
                constructor() {
                    this.canvas = document.getElementById('videoCanvas');
                    this.ctx = this.canvas.getContext('2d');
                    this.frameCount = 0;
                    this.lastFrameTime = Date.now();
                    this.fps = 0;
                    this.frameBuffer = [];
                    this.maxBufferSize = 3;
                    this.isProcessing = false;
                    this.performanceMonitor = {
                        avgRenderTime: 0,
                        droppedFrames: 0,
                        totalFrames: 0
                    };
                    
                    this.statusIndicator = document.getElementById('statusIndicator');
                    this.statusText = document.getElementById('statusText');
                    this.liveIndicator = document.getElementById('liveIndicator');
                    this.recordIndicator = document.getElementById('recordIndicator');
                    
                    this.mediaRecorder = null;
                    this.recordedChunks = [];
                    this.isRecording = false;
                    this.canvasStream = null;
                    
                    this.initializeCanvas();
                    this.setupMessageHandler();
                    this.startPerformanceMonitoring();
                    this.initializeRecording();
                }

                initializeCanvas() {
                    const resizeCanvas = () => {
                        this.canvas.width = window.innerWidth;
                        this.canvas.height = window.innerHeight;
                        console.log('Canvas初始化:', this.canvas.width, 'x', this.canvas.height);
                        
                        if (this.canvasStream) {
                            this.canvasStream = this.canvas.captureStream(30);
                        }
                    };
                    
                    resizeCanvas();
                    window.addEventListener('resize', resizeCanvas);
                    
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                }

                initializeRecording() {
                    try {
                        if (!this.canvas.captureStream) {
                            console.error('浏览器不支持 captureStream');
                            this.postMessage({
                                type: 'recording_error',
                                error: '浏览器不支持录制功能'
                            });
                            return;
                        }

                        if (!window.MediaRecorder) {
                            console.error('浏览器不支持 MediaRecorder');
                            this.postMessage({
                                type: 'recording_error',
                                error: '浏览器不支持录制功能'
                            });
                            return;
                        }

                        this.canvasStream = this.canvas.captureStream(30);
                        console.log('Canvas流初始化成功');
                    } catch (error) {
                        console.error('Canvas流初始化失败:', error);
                        this.postMessage({
                            type: 'recording_error',
                            error: 'Canvas流初始化失败: ' + error.message
                        });
                    }
                }

                setupMessageHandler() {
                    window.addEventListener('message', (event) => {
                        try {
                            const data = JSON.parse(event.data);
                            this.handleMessage(data);
                        } catch (error) {
                            console.error('消息解析失败:', error);
                        }
                    });

                    if (window.ReactNativeWebView) {
                        document.addEventListener('message', (event) => {
                            try {
                                const data = JSON.parse(event.data);
                                this.handleMessage(data);
                            } catch (error) {
                                console.error('Android消息解析失败:', error);
                            }
                        });
                    }
                }

                handleMessage(data) {
                    switch (data.type) {
                        case 'video_frame':
                            this.renderFrame(data.frameData, data.frameNumber);
                            break;
                        case 'connection_status':
                            this.updateStatus(data.status, data.isStreaming);
                            break;
                        case 'clear_canvas':
                            this.clearCanvas();
                            break;
                        case 'start_recording':
                            this.startRecording();
                            break;
                        case 'stop_recording':
                            this.stopRecording();
                            break;
                        case 'reset_recording_state':
                            this.resetRecordingState();
                            break;
                        default:
                            console.log('未知消息类型:', data.type);
                    }
                }

                startRecording() {
                    try {
                        if (this.isRecording) {
                            console.log('已在录制中');
                            return;
                        }

                        if (!this.canvasStream) {
                            this.canvasStream = this.canvas.captureStream(30);
                        }

                        let mimeType = 'video/webm;codecs=vp9';
                        if (!MediaRecorder.isTypeSupported(mimeType)) {
                            mimeType = 'video/webm;codecs=vp8';
                            if (!MediaRecorder.isTypeSupported(mimeType)) {
                                mimeType = 'video/webm';
                                if (!MediaRecorder.isTypeSupported(mimeType)) {
                                    throw new Error('浏览器不支持WebM录制格式');
                                }
                            }
                        }

                        this.recordedChunks = [];
                        this.mediaRecorder = new MediaRecorder(this.canvasStream, {
                            mimeType: mimeType
                        });

                        this.mediaRecorder.ondataavailable = (event) => {
                            if (event.data.size > 0) {
                                this.recordedChunks.push(event.data);
                                console.log('录制数据块大小:', event.data.size);
                            }
                        };

                        this.mediaRecorder.onstop = () => {
                            this.handleRecordingStop();
                        };

                        this.mediaRecorder.onerror = (error) => {
                            console.error('MediaRecorder错误:', error);
                            this.postMessage({
                                type: 'recording_error',
                                error: 'MediaRecorder错误: ' + error.message
                            });
                        };

                        this.mediaRecorder.start(1000);
                        this.isRecording = true;
                        
                        this.recordIndicator.className = 'recording';
                        
                        this.postMessage({
                            type: 'recording_started'
                        });

                        console.log('开始录制，使用格式:', mimeType);
                    } catch (error) {
                        console.error('启动录制失败:', error);
                        this.postMessage({
                            type: 'recording_error',
                            error: '启动录制失败: ' + error.message
                        });
                    }
                }

                stopRecording() {
                    try {
                        console.log('接收到停止录制请求');
                        
                        if (!this.isRecording || !this.mediaRecorder) {
                            console.log('未在录制中，但确保状态一致');
                            this.isRecording = false;
                            this.recordIndicator.className = '';
                            this.postMessage({
                                type: 'recording_error',
                                error: '当前未在录制中'
                            });
                            return;
                        }

                        // 检查MediaRecorder状态
                        if (this.mediaRecorder.state === 'inactive') {
                            console.log('MediaRecorder已处于非活动状态');
                            this.isRecording = false;
                            this.recordIndicator.className = '';
                            this.postMessage({
                                type: 'recording_error',
                                error: '录制器已停止'
                            });
                            return;
                        }

                        console.log('MediaRecorder状态:', this.mediaRecorder.state);
                        
                        // 设置超时，如果3秒内没有收到停止事件，强制重置状态
                        const stopTimeout = setTimeout(() => {
                            console.error('停止录制超时，强制重置状态');
                            this.isRecording = false;
                            this.recordIndicator.className = '';
                            this.postMessage({
                                type: 'recording_error',
                                error: '停止录制超时，请重试'
                            });
                        }, 3000);

                        // 停止录制
                        this.mediaRecorder.stop();
                        
                        // 清除超时
                        setTimeout(() => clearTimeout(stopTimeout), 100);
                        
                        console.log('停止录制指令已发送');
                    } catch (error) {
                        console.error('停止录制失败:', error);
                        this.isRecording = false;
                        this.recordIndicator.className = '';
                        this.postMessage({
                            type: 'recording_error',
                            error: '停止录制失败: ' + error.message
                        });
                    }
                }

                handleRecordingStop() {
                    try {
                        console.log('开始处理录制完成事件');
                        
                        // 立即重置UI状态
                        this.isRecording = false;
                        this.recordIndicator.className = '';
                        
                        if (this.recordedChunks.length === 0) {
                            throw new Error('没有录制到任何数据');
                        }

                        const blob = new Blob(this.recordedChunks, {
                            type: 'video/webm'
                        });

                        console.log('录制完成，总数据块:', this.recordedChunks.length, '文件大小:', blob.size);

                        if (blob.size === 0) {
                            throw new Error('录制文件为空');
                        }
                        
                        // 检查文件大小，过大的文件可能导致转换失败
                        const maxSize = 50 * 1024 * 1024; // 50MB限制
                        if (blob.size > maxSize) {
                            console.warn('录制文件过大:', blob.size, '字节，可能导致处理失败');
                            this.postMessage({
                                type: 'recording_error',
                                error: '录制文件过大 (' + (blob.size / 1024 / 1024).toFixed(1) + 'MB)，请录制较短的视频'
                            });
                            return;
                        }

                        // 清理录制数据，防止内存泄漏
                        const recordedData = [...this.recordedChunks];
                        this.recordedChunks = [];

                        const reader = new FileReader();
                        reader.onload = async () => {
                            try {
                                const arrayBuffer = reader.result;
                                const uint8Array = new Uint8Array(arrayBuffer);
                                
                                console.log('开始转换文件，大小:', uint8Array.length, 'bytes');
                                
                                // 使用异步分块处理来避免栈溢出和阻塞
                                const convertToBase64Async = async (bytes) => {
                                    const chunkSize = 4096; // 减小块大小
                                    let binary = '';
                                    
                                    for (let i = 0; i < bytes.length; i += chunkSize) {
                                        const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
                                        
                                        // 安全地转换每个块
                                        try {
                                            let chunkBinary = '';
                                            for (let j = 0; j < chunk.length; j++) {
                                                chunkBinary += String.fromCharCode(chunk[j]);
                                            }
                                            binary += chunkBinary;
                                        } catch (chunkError) {
                                            console.error('处理数据块失败:', chunkError);
                                            throw chunkError;
                                        }
                                        
                                        // 每处理一定数量的块后暂停一下，让出执行权
                                        if (i % (chunkSize * 10) === 0) {
                                            await new Promise(resolve => setTimeout(resolve, 1));
                                            console.log('转换进度:', ((i / bytes.length) * 100).toFixed(1) + '%');
                                        }
                                    }
                                    
                                    return btoa(binary);
                                };
                                
                                const base64 = await convertToBase64Async(uint8Array);
                                
                                console.log('文件转换完成，Base64长度:', base64.length);
                                this.postMessage({
                                    type: 'recording_completed',
                                    videoData: base64,
                                    size: blob.size
                                });
                            } catch (error) {
                                console.error('文件转换失败:', error);
                                this.postMessage({
                                    type: 'recording_error',
                                    error: '文件转换失败: ' + error.message
                                });
                            }
                        };
                        
                        reader.onerror = () => {
                            console.error('文件读取失败');
                            this.postMessage({
                                type: 'recording_error',
                                error: '读取录制文件失败'
                            });
                        };
                        
                        reader.readAsArrayBuffer(blob);
                    } catch (error) {
                        console.error('处理录制完成失败:', error);
                        this.isRecording = false;
                        this.recordIndicator.className = '';
                        this.postMessage({
                            type: 'recording_error',
                            error: '处理录制完成失败: ' + error.message
                        });
                    }
                }

                resetRecordingState() {
                    console.log('重置录制状态');
                    try {
                        // 如果MediaRecorder还在录制，尝试停止
                        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                            this.mediaRecorder.stop();
                        }
                    } catch (error) {
                        console.error('停止MediaRecorder失败:', error);
                    }
                    
                    // 重置所有录制相关状态
                    this.isRecording = false;
                    this.recordedChunks = [];
                    this.recordIndicator.className = '';
                    this.mediaRecorder = null;
                    
                    // 重新初始化录制功能
                    this.initializeRecording();
                    
                    console.log('录制状态已重置');
                }

                renderFrame(frameData, frameNumber) {
                    if (!frameData || this.isProcessing) {
                        if (!frameData) this.performanceMonitor.droppedFrames++;
                        return;
                    }

                    this.frameBuffer.push({ frameData, frameNumber, timestamp: Date.now() });
                    if (this.frameBuffer.length > this.maxBufferSize) {
                        this.frameBuffer.shift();
                    }

                    this.processNextFrame();
                }

                processNextFrame() {
                    if (this.isProcessing || this.frameBuffer.length === 0) return;
                    
                    this.isProcessing = true;
                    const startTime = performance.now();
                    const { frameData, frameNumber } = this.frameBuffer.shift();

                    const img = new Image();
                    
                    img.onload = () => {
                        try {
                            requestAnimationFrame(() => {
                                this.ctx.fillStyle = '#000';
                                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                                
                                const canvasAspect = this.canvas.width / this.canvas.height;
                                const imgAspect = img.width / img.height;
                                
                                let drawWidth, drawHeight, drawX, drawY;
                                
                                if (imgAspect > canvasAspect) {
                                    drawWidth = this.canvas.width;
                                    drawHeight = drawWidth / imgAspect;
                                    drawX = 0;
                                    drawY = (this.canvas.height - drawHeight) / 2;
                                } else {
                                    drawHeight = this.canvas.height;
                                    drawWidth = drawHeight * imgAspect;
                                    drawX = (this.canvas.width - drawWidth) / 2;
                                    drawY = 0;
                                }
                                
                                this.ctx.imageSmoothingEnabled = true;
                                this.ctx.imageSmoothingQuality = 'medium';
                                this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                                
                                this.updateStats(frameNumber, startTime);
                                this.isProcessing = false;
                                
                                if (this.frameBuffer.length > 0) {
                                    setTimeout(() => this.processNextFrame(), 16);
                                }
                            });
                        } catch (error) {
                            console.error('帧渲染错误:', error);
                            this.isProcessing = false;
                        }
                    };
                    
                    img.onerror = () => {
                        console.error('图像加载失败');
                        this.performanceMonitor.droppedFrames++;
                        this.isProcessing = false;
                    };
                    
                    img.src = 'data:image/jpeg;base64,' + frameData;
                }

                updateStats(frameNumber, startTime) {
                    this.frameCount = frameNumber;
                    this.performanceMonitor.totalFrames++;
                    
                    const renderTime = performance.now() - startTime;
                    this.performanceMonitor.avgRenderTime = 
                        (this.performanceMonitor.avgRenderTime * 0.9) + (renderTime * 0.1);

                    const now = Date.now();
                    if (now - this.lastFrameTime > 1000) {
                        this.fps = this.performanceMonitor.totalFrames / ((now - this.lastFrameTime) / 1000);
                        this.lastFrameTime = now;
                        this.performanceMonitor.totalFrames = 0;
                        
                        this.postMessage({
                            type: 'stats_update',
                            fps: this.fps.toFixed(1),
                            frameNumber: frameNumber,
                            performance: {
                                avgRenderTime: this.performanceMonitor.avgRenderTime.toFixed(2),
                                droppedFrames: this.performanceMonitor.droppedFrames,
                                bufferSize: this.frameBuffer.length
                            }
                        });
                    }
                }

                startPerformanceMonitoring() {
                    setInterval(() => {
                        if (this.performanceMonitor.avgRenderTime > 50) {
                            this.frameBuffer = this.frameBuffer.slice(-1);
                        }
                        
                        if (this.performanceMonitor.droppedFrames > 100) {
                            this.performanceMonitor.droppedFrames = 0;
                        }
                    }, 5000);
                }

                updateStatus(status, isStreaming) {
                    this.statusIndicator.className = status;
                    
                    switch (status) {
                        case 'connected':
                            this.statusText.textContent = '已连接';
                            break;
                        case 'error':
                            this.statusText.textContent = '连接错误';
                            break;
                        default:
                            this.statusText.textContent = '连接中...';
                    }
                    
                    if (isStreaming) {
                        this.liveIndicator.className = 'show';
                        this.liveIndicator.textContent = '● LIVE';
                    } else {
                        this.liveIndicator.className = '';
                        this.liveIndicator.textContent = '';
                    }
                }

                clearCanvas() {
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                }

                postMessage(data) {
                    try {
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify(data));
                        } else if (window.parent) {
                            window.parent.postMessage(JSON.stringify(data), '*');
                        }
                    } catch (error) {
                        console.error('发送消息失败:', error);
                    }
                }
            }

            const canvasStream = new CanvasVideoStream();
            console.log('Canvas视频流系统初始化完成');
        </script>
    </body>
    </html>
  `;

  // 保持原有的WebSocket相关代码...
  const getWebSocketUrl = () => {
    const websocketURL = IPDetector.getWebSocketURL();
    console.log('[VideoStreamViewer] WebView模式使用WebSocket:', websocketURL);
    return websocketURL;
  };

  useEffect(() => {
    console.log('[VideoStreamViewer] WebView模式初始化');
    connectToVideoStream();

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, []);

  const connectToVideoStream = () => {
    try {
      const wsUrl = getWebSocketUrl();
      console.log('WebView模式连接到视频流服务器:', wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebView模式WebSocket连接已建立');
        setConnectionStatus('connected');

        sendToWebView({
          type: 'connection_status',
          status: 'connected',
          isStreaming: false,
        });

        if (onConnectionChange) {
          onConnectionChange(true);
        }

        ws.send(JSON.stringify({type: 'join_as_viewer'}));
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
        console.error('WebView模式WebSocket错误:', error);
        setConnectionStatus('error');
        sendToWebView({
          type: 'connection_status',
          status: 'error',
          isStreaming: false,
        });
      };

      ws.onclose = () => {
        console.log('WebView模式WebSocket连接已关闭');
        setConnectionStatus('disconnected');
        setIsStreaming(false);

        sendToWebView({
          type: 'connection_status',
          status: 'disconnected',
          isStreaming: false,
        });

        if (onConnectionChange) {
          onConnectionChange(false);
        }

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

  const handleWebSocketMessage = data => {
    switch (data.type) {
      case 'welcome':
        console.log('WebView模式收到欢迎消息:', data.message);
        break;
      case 'viewer_joined':
        console.log('WebView模式成功加入为观看者');
        setIsStreaming(data.isStreaming);
        sendToWebView({
          type: 'connection_status',
          status: 'connected',
          isStreaming: data.isStreaming,
        });
        break;
      case 'stream_started':
        console.log('WebView模式视频流开始');
        setIsStreaming(true);
        sendToWebView({
          type: 'connection_status',
          status: 'connected',
          isStreaming: true,
        });
        break;
      case 'stream_stopped':
        console.log('WebView模式视频流停止');
        setIsStreaming(false);
        sendToWebView({
          type: 'connection_status',
          status: 'connected',
          isStreaming: false,
        });
        sendToWebView({type: 'clear_canvas'});
        break;
      case 'video_frame':
        sendToWebView({
          type: 'video_frame',
          frameData: data.frameData,
          frameNumber: data.frameNumber,
        });
        break;
      default:
        console.log('WebView模式未处理的消息类型:', data.type);
    }
  };

  const sendToWebView = message => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  };

  const handleWebViewMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case 'stats_update':
          if (onStatsUpdate) {
            onStatsUpdate({
              fps: parseFloat(data.fps),
              frameNumber: data.frameNumber,
              mode: 'webview_canvas',
            });
          }
          break;
        case 'recording_started':
          console.log('录制已开始');
          setIsRecording(true);
          break;
        case 'recording_completed':
          console.log('录制完成，开始处理保存');
          handleRecordingCompleted(data.videoData, data.size);
          break;
        case 'recording_error':
          console.error('录制错误:', data.error);
          setIsRecording(false);
          Alert.alert('录制错误', data.error);
          break;
        default:
          console.log('来自WebView的消息:', data);
      }
    } catch (error) {
      console.error('处理WebView消息失败:', error);
      // 如果是录制相关的消息处理失败，重置录制状态
      setIsRecording(false);
    }
  };

  // 改进的录制完成处理函数
  const handleRecordingCompleted = async (videoData, size) => {
    console.log('开始处理录制完成，数据大小:', size);

    try {
      // 确保录制状态被重置
      setIsRecording(false);

      if (!videoData || size === 0) {
        throw new Error('录制数据为空或无效');
      }

      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          '权限错误',
          '无法获取存储权限，请在设置中手动开启应用的存储权限',
          [
            {text: '取消'},
            {text: '去设置', onPress: () => Linking.openSettings()},
          ],
        );
        return;
      }

      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `video_recording_${timestamp}.webm`;

      // 获取保存路径
      const savePath = await getSavePath();
      const filePath = `${savePath}/${fileName}`;

      console.log('保存录制文件到:', filePath);

      // 将base64转换为文件
      await RNFS.writeFile(filePath, videoData, 'base64');

      console.log('录制文件已保存:', filePath);

      // 检查文件是否创建成功
      const fileExists = await RNFS.exists(filePath);
      if (fileExists) {
        const fileStats = await RNFS.stat(filePath);

        // 检查是否为用户可访问路径
        const isAccessible = isUserAccessiblePath(filePath);

        let locationMessage = '';
        let accessibilityMessage = '';

        if (filePath.includes('VideoRecordings')) {
          if (filePath.includes('Download')) {
            locationMessage = '下载文件夹 > VideoRecordings';
          } else if (filePath.includes('Movies')) {
            locationMessage = '影片文件夹 > VideoRecordings';
          } else if (filePath.includes('DCIM')) {
            locationMessage = '相机文件夹 > VideoRecordings';
          } else {
            locationMessage = 'VideoRecordings 文件夹';
          }
        } else if (filePath.includes('Download')) {
          locationMessage = '下载文件夹';
        } else {
          locationMessage = '应用目录';
        }

        if (isAccessible) {
          accessibilityMessage = '\n✅ 可通过文件管理器访问';
        } else {
          accessibilityMessage = '\n⚠️ 仅应用内可访问';
        }

        Alert.alert(
          '🎥 录制完成',
          `视频已保存成功！\n\n📁 文件名: ${fileName}\n📊 文件大小: ${(
            fileStats.size /
            1024 /
            1024
          ).toFixed(
            2,
          )} MB\n📍 保存位置: ${locationMessage}${accessibilityMessage}\n\n完整路径:\n${filePath}`,
          [
            {text: '确定'},
            isAccessible && {
              text: '打开文件夹',
              onPress: async () => {
                try {
                  // 尝试打开文件管理器到特定位置
                  const intent = `content://com.android.externalstorage.documents/document/primary:${savePath.replace(
                    '/storage/emulated/0/',
                    '',
                  )}`;
                  await Linking.openURL(intent);
                } catch (error) {
                  // 备用方案：打开通用文件管理器
                  try {
                    await Linking.openURL(
                      'content://com.android.externalstorage.documents/document/primary:',
                    );
                  } catch (fallbackError) {
                    Alert.alert(
                      '提示',
                      '无法自动打开文件管理器，请手动查找文件',
                    );
                  }
                }
              },
            },
          ].filter(Boolean),
        );
      } else {
        throw new Error('文件保存失败，文件不存在');
      }
    } catch (error) {
      console.error('保存录制文件失败:', error);

      // 确保录制状态被重置
      setIsRecording(false);

      Alert.alert(
        '保存失败',
        `无法保存录制文件: ${error.message}\n\n请检查应用是否有存储权限`,
        [
          {text: '确定'},
          {text: '去设置', onPress: () => Linking.openSettings()},
        ],
      );
    }
  };

  // 重置录制状态的辅助函数
  const resetRecordingState = () => {
    console.log('重置录制状态');
    setIsRecording(false);
    // 同时通知WebView重置状态
    sendToWebView({type: 'reset_recording_state'});
  };

  // 开始录制
  const startRecording = async () => {
    try {
      console.log('尝试开始录制...');

      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          '权限错误',
          '无法获取存储权限，无法录制\n\n请在手机设置中手动开启应用的存储权限',
          [
            {text: '取消'},
            {text: '去设置', onPress: () => Linking.openSettings()},
          ],
        );
        return;
      }

      console.log('权限获取成功，开始录制');
      setIsRecording(true);
      sendToWebView({type: 'start_recording'});
    } catch (error) {
      console.error('开始录制失败:', error);
      Alert.alert('录制错误', '无法开始录制: ' + error.message);
    }
  };

  // 停止录制
  const stopRecording = () => {
    console.log('用户点击停止录制');

    // 先设置状态为停止中，避免重复点击
    if (!isRecording) {
      console.log('录制未开始，忽略停止请求');
      return;
    }

    try {
      sendToWebView({type: 'stop_recording'});
      console.log('已发送停止录制指令到WebView');
    } catch (error) {
      console.error('发送停止录制指令失败:', error);
      setIsRecording(false);
      Alert.alert('错误', '停止录制失败: ' + error.message);
    }
  };

  // 摄像头控制函数
  const sendCameraControl = (command, parameters = {}) => {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(
        JSON.stringify({
          type: 'camera_control',
          command: command,
          parameters: parameters,
        }),
      );

      if (onCameraControl) {
        onCameraControl(command, parameters);
      }
    } else {
      Alert.alert('连接错误', '无法发送控制命令，请检查连接状态');
    }
  };

  // Drawer动画切换
  const toggleDrawer = () => {
    if (drawerOpen) {
      Animated.timing(drawerAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => setDrawerOpen(false));
    } else {
      setDrawerOpen(true);
      Animated.timing(drawerAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  };

  // Drawer translateX动画
  const drawerTranslate = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 110],
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{html: webViewHTML}}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          scalesPageToFit={false}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onError={error => {
            console.error('WebView错误:', error);
          }}
          onLoad={() => {
            console.log('WebView加载完成');
          }}
        />
      </View>

      <View style={styles.drawerWrapper}>
        <TouchableOpacity
          style={styles.drawerTrigger}
          activeOpacity={0.85}
          onPress={toggleDrawer}>
          <View style={styles.drawerCircle}>
            <Text style={styles.drawerIcon}>≡</Text>
          </View>
        </TouchableOpacity>
        <Animated.View
          style={[
            styles.drawer,
            {
              opacity: drawerAnim,
              transform: [{translateX: drawerTranslate}],
            },
          ]}
          pointerEvents={drawerOpen ? 'auto' : 'none'}>
          <TouchableOpacity
            style={styles.drawerButton}
            onPress={() => {
              toggleDrawer();
              connectToVideoStream();
            }}>
            <Text style={styles.drawerButtonText}>重连</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.drawerButton}
            onPress={() => {
              toggleDrawer();
              sendCameraControl('take_photo');
            }}>
            <Text style={styles.drawerButtonText}>拍照</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.drawerButton}
            onPress={() => {
              toggleDrawer();
              sendCameraControl(
                isStreaming ? 'stop_streaming' : 'start_streaming',
              );
            }}>
            <Text style={styles.drawerButtonText}>
              {isStreaming ? '中断' : '开始'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.drawerButton, isRecording && styles.recordingButton]}
            onPress={() => {
              toggleDrawer();
              if (isRecording) {
                console.log('用户点击停止录制');
                stopRecording();
              } else {
                console.log('用户点击开始录制');
                // 在开始录制前重置状态，确保干净的开始
                resetRecordingState();
                setTimeout(() => {
                  startRecording();
                }, 100);
              }
            }}>
            <Text
              style={[
                styles.drawerButtonText,
                isRecording && styles.recordingButtonText,
              ]}>
              {isRecording ? '停止' : '录制'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f2ff',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webViewContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  drawerWrapper: {
    position: 'absolute',
    left: 18,
    bottom: 22,
    zIndex: 1010,
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerTrigger: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(40, 170, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2caafc',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 8,
  },
  drawerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(40, 170, 255, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerIcon: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  drawer: {
    position: 'absolute',
    left: 60,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(35,35,35,0.97)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
    minWidth: 110,
  },
  drawerButton: {
    marginHorizontal: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    minWidth: 54,
    alignItems: 'center',
  },
  drawerButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderColor: 'rgba(255, 0, 0, 0.9)',
  },
  recordingButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default VideoStreamViewer;
