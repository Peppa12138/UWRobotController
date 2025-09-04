import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import {WebView} from 'react-native-webview';
import IPDetector from '../../utils/IPDetector';

const VideoStreamViewer = ({
  style,
  onCameraControl,
  onConnectionChange,
  onStatsUpdate,
}) => {
  const [wsConnection, setWsConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isStreaming, setIsStreaming] = useState(false);
  const webViewRef = useRef(null);

  // 抽屉动画相关
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(0)).current;

  // WebView HTML内容 - 使用Canvas直接渲染
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
            @keyframes liveBlink {
                0%, 50% { opacity: 1; transform: scale(1); }
                25% { transform: scale(1.05); }
                51%, 100% { opacity: 0.85; }
            }
            /* 新增：状态字体描边样式 */
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
            <div id="liveIndicator">● LIVE</div>
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
                    this.maxBufferSize = 3; // 缓冲3帧减少卡顿
                    this.isProcessing = false;
                    this.performanceMonitor = {
                        avgRenderTime: 0,
                        droppedFrames: 0,
                        totalFrames: 0
                    };
                    
                    // 状态元素
                    this.statusIndicator = document.getElementById('statusIndicator');
                    this.statusText = document.getElementById('statusText');
                    this.liveIndicator = document.getElementById('liveIndicator');
                    
                    this.initializeCanvas();
                    this.setupMessageHandler();
                    this.startPerformanceMonitoring();
                }

                initializeCanvas() {
                    // 设置Canvas尺寸
                    const resizeCanvas = () => {
                        this.canvas.width = window.innerWidth;
                        this.canvas.height = window.innerHeight;
                        console.log('Canvas初始化:', this.canvas.width, 'x', this.canvas.height);
                    };
                    
                    resizeCanvas();
                    window.addEventListener('resize', resizeCanvas);
                    
                    // 清空画布
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                }

                setupMessageHandler() {
                    // 监听来自React Native的消息
                    window.addEventListener('message', (event) => {
                        try {
                            const data = JSON.parse(event.data);
                            this.handleMessage(data);
                        } catch (error) {
                            console.error('消息解析失败:', error);
                        }
                    });

                    // Android WebView消息处理
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
                        default:
                            console.log('未知消息类型:', data.type);
                    }
                }

                renderFrame(frameData, frameNumber) {
                    if (!frameData || this.isProcessing) {
                        if (!frameData) this.performanceMonitor.droppedFrames++;
                        return;
                    }

                    // 帧缓冲管理
                    this.frameBuffer.push({ frameData, frameNumber, timestamp: Date.now() });
                    if (this.frameBuffer.length > this.maxBufferSize) {
                        this.frameBuffer.shift(); // 移除最老的帧
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
                            // 使用requestAnimationFrame优化渲染
                            requestAnimationFrame(() => {
                                // 清空画布
                                this.ctx.fillStyle = '#000';
                                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                                
                                // 计算居中显示的位置和尺寸
                                const canvasAspect = this.canvas.width / this.canvas.height;
                                const imgAspect = img.width / img.height;
                                
                                let drawWidth, drawHeight, drawX, drawY;
                                
                                if (imgAspect > canvasAspect) {
                                    // 图片更宽，以宽度为准
                                    drawWidth = this.canvas.width;
                                    drawHeight = drawWidth / imgAspect;
                                    drawX = 0;
                                    drawY = (this.canvas.height - drawHeight) / 2;
                                } else {
                                    // 图片更高，以高度为准
                                    drawHeight = this.canvas.height;
                                    drawWidth = drawHeight * imgAspect;
                                    drawX = (this.canvas.width - drawWidth) / 2;
                                    drawY = 0;
                                }
                                
                                // 优化的图像绘制
                                this.ctx.imageSmoothingEnabled = true;
                                this.ctx.imageSmoothingQuality = 'medium';
                                this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                                
                                // 更新统计
                                this.updateStats(frameNumber, startTime);
                                this.isProcessing = false;
                                
                                // 处理下一帧
                                if (this.frameBuffer.length > 0) {
                                    setTimeout(() => this.processNextFrame(), 16); // ~60fps限制
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
                        
                        // 发送优化的统计信息回React Native
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
                        // 如果平均渲染时间过长，清理缓冲区
                        if (this.performanceMonitor.avgRenderTime > 50) {
                            this.frameBuffer = this.frameBuffer.slice(-1); // 只保留最新帧
                        }
                        
                        // 重置掉帧计数
                        if (this.performanceMonitor.droppedFrames > 100) {
                            this.performanceMonitor.droppedFrames = 0;
                        }
                    }, 5000);
                }

                updateStatus(status, isStreaming) {
                    // 更新连接状态
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
                    
                    // 更新LIVE指示器
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

            // 初始化Canvas视频流
            const canvasStream = new CanvasVideoStream();
            console.log('Canvas视频流系统初始化完成');
        </script>
    </body>
    </html>
  `;

  // 获取WebSocket URL
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

  // 连接到视频流WebSocket服务器
  const connectToVideoStream = () => {
    try {
      const wsUrl = getWebSocketUrl();
      console.log('WebView模式连接到视频流服务器:', wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebView模式WebSocket连接已建立');
        setConnectionStatus('connected');

        // 更新WebView状态
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

  // 处理WebSocket消息
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
        // 直接转发给WebView进行Canvas渲染
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

  // 发送消息到WebView
  const sendToWebView = message => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  };

  // 处理来自WebView的消息
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
        default:
          console.log('来自WebView的消息:', data);
      }
    } catch (error) {
      console.error('处理WebView消息失败:', error);
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

  // Drawer translateX动画, 按钮从左下角圆圈右侧滑出
  const drawerTranslate = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 110], // drawer最大宽度
  });

  return (
    <View style={[styles.container, style]}>
      {/* WebView Canvas视频渲染 */}
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

      {/* 右拉抽屉控制按钮组 */}
      <View style={styles.drawerWrapper}>
        {/* 抽屉按钮（圆圈） */}
        <TouchableOpacity
          style={styles.drawerTrigger}
          activeOpacity={0.85}
          onPress={toggleDrawer}>
          <View style={styles.drawerCircle}>
            <Text style={styles.drawerIcon}>≡</Text>
          </View>
        </TouchableOpacity>
        {/* 抽屉内容（按钮组） */}
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
    backgroundColor: '#000', // WebView内容覆盖
  },
  // Drawer（抽屉）相关样式
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
  // 不再需要原先的controlsContainer
});

export default VideoStreamViewer;
