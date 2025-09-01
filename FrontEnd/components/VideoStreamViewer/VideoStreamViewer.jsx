import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Alert} from 'react-native';
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
                background: #000; 
                overflow: hidden; 
                font-family: Arial, sans-serif;
            }
            #videoCanvas { 
                width: 100vw; 
                height: 100vh; 
                object-fit: contain;
                background: #000;
            }
            #statusBar {
                position: absolute;
                top: 10px;
                left: 10px;
                right: 10px;
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            #statusIndicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #FFC107;
                margin-right: 8px;
            }
            #statusIndicator.connected { background: #4CAF50; }
            #statusIndicator.error { background: #F44336; }
            #liveIndicator {
                color: #F44336;
                font-weight: bold;
                display: none;
            }
            #liveIndicator.show { display: block; }
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
                    this.lastFrameTime = 0;
                    this.fps = 0;
                    
                    // 状态元素
                    this.statusIndicator = document.getElementById('statusIndicator');
                    this.statusText = document.getElementById('statusText');
                    this.liveIndicator = document.getElementById('liveIndicator');
                    
                    this.initializeCanvas();
                    this.setupMessageHandler();
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
                    if (!frameData) return;

                    const img = new Image();
                    
                    img.onload = () => {
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
                        
                        // 绘制图像
                        this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                        
                        // 更新统计
                        this.frameCount = frameNumber;
                        const now = Date.now();
                        if (now - this.lastFrameTime > 1000) {
                            this.fps = this.frameCount / ((now - this.lastFrameTime) / 1000);
                            this.lastFrameTime = now;
                            
                            // 发送统计信息回React Native
                            this.postMessage({
                                type: 'stats_update',
                                fps: this.fps.toFixed(1),
                                frameNumber: frameNumber
                            });
                        }
                    };
                    
                    img.onerror = (error) => {
                        console.error('图像加载失败:', error);
                    };
                    
                    // 设置图像源
                    img.src = 'data:image/jpeg;base64,' + frameData;
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
                    
                    // 更新直播状态
                    if (isStreaming) {
                        this.liveIndicator.className = 'show';
                    } else {
                        this.liveIndicator.className = '';
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
          isStreaming: false
        });

        if (onConnectionChange) {
          onConnectionChange(true);
        }

        ws.send(JSON.stringify({ type: 'join_as_viewer' }));
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
          isStreaming: false
        });
      };

      ws.onclose = () => {
        console.log('WebView模式WebSocket连接已关闭');
        setConnectionStatus('disconnected');
        setIsStreaming(false);
        
        sendToWebView({
          type: 'connection_status',
          status: 'disconnected',
          isStreaming: false
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
          isStreaming: data.isStreaming
        });
        break;
      case 'stream_started':
        console.log('WebView模式视频流开始');
        setIsStreaming(true);
        sendToWebView({
          type: 'connection_status',
          status: 'connected',
          isStreaming: true
        });
        break;
      case 'stream_stopped':
        console.log('WebView模式视频流停止');
        setIsStreaming(false);
        sendToWebView({
          type: 'connection_status',
          status: 'connected',
          isStreaming: false
        });
        sendToWebView({ type: 'clear_canvas' });
        break;
      case 'video_frame':
        // 直接转发给WebView进行Canvas渲染
        sendToWebView({
          type: 'video_frame',
          frameData: data.frameData,
          frameNumber: data.frameNumber
        });
        break;
      default:
        console.log('WebView模式未处理的消息类型:', data.type);
    }
  };

  // 发送消息到WebView
  const sendToWebView = (message) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  };

  // 处理来自WebView的消息
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'stats_update':
          if (onStatsUpdate) {
            onStatsUpdate({
              fps: parseFloat(data.fps),
              frameNumber: data.frameNumber,
              mode: 'webview_canvas'
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

  return (
    <View style={[styles.container, style]}>
      {/* WebView Canvas视频渲染 */}
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: webViewHTML }}
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
          onError={(error) => {
            console.error('WebView错误:', error);
          }}
          onLoad={() => {
            console.log('WebView加载完成');
          }}
        />
      </View>

      {/* 控制按钮 */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => sendCameraControl('take_photo')}>
          <Text style={styles.controlText}>拍照</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => sendCameraControl(isStreaming ? 'stop_streaming' : 'start_streaming')}>
          <Text style={styles.controlText}>
            {isStreaming ? '停止' : '开始'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => connectToVideoStream()}>
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
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  controlText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default VideoStreamViewer;
