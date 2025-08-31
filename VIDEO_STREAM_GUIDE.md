# 视频流系统使用指南

## 系统概述

这个系统实现了电脑端摄像头模拟手机端拍摄的功能，通过WebSocket实时传输视频流到Android应用中。

## 系统架构

```
电脑端摄像头模拟器 (HTML5) 
        ↓ WebSocket
    后端服务器 (Node.js + Express + WebSocket)
        ↓ WebSocket  
Android APP (React Native)
```

## 快速开始

### 1. 启动后端服务器

在项目根目录下运行：

```bash
cd BackEnd
npm install
node app.js
```

服务器将在端口5000上启动，并提供以下服务：
- HTTP API: `http://localhost:5000`
- WebSocket视频流: `ws://localhost:5000/video-stream`

### 2. 启动电脑端摄像头模拟器

1. 打开 `camera_simulator.html` 文件（可以直接双击或用浏览器打开）
2. 点击"启动摄像头"按钮，允许浏览器访问摄像头
3. 点击"连接服务器"按钮，连接到后端服务器
4. 点击"开始推流"按钮，开始向服务器推送视频流

### 3. 启动Android应用

```bash
# 在项目根目录下
yarn android
# 或
npm run android
```

## 功能说明

### 电脑端摄像头模拟器功能

- **摄像头控制**：启动/停止本地摄像头
- **视频推流**：将摄像头画面实时推送到服务器
- **远程控制**：接收来自APP的控制命令
- **实时监控**：显示连接状态、帧率、推流信息

### Android APP功能

- **视频观看**：实时接收并显示来自电脑端的视频流
- **远程控制**：发送拍照、开始/停止推流等控制命令
- **状态监控**：显示连接状态、视频流状态、延迟信息

### 后端服务器功能

- **WebSocket服务**：管理客户端连接，转发视频流数据
- **API接口**：提供状态查询、摄像头控制等REST API
- **连接管理**：区分推流者和观看者，管理多客户端连接

## API接口

### WebSocket消息格式

#### 推流者 → 服务器

```javascript
// 开始推流
{
  "type": "start_stream",
  "resolution": "1920x1080",
  "fps": 30,
  "codec": "JPEG"
}

// 视频帧数据
{
  "type": "video_frame",
  "frameData": "base64编码的图片数据",
  "timestamp": 1640995200000,
  "frameNumber": 123
}

// 停止推流
{
  "type": "stop_stream"
}
```

#### 观看者 → 服务器

```javascript
// 加入为观看者
{
  "type": "join_as_viewer"
}

// 摄像头控制命令
{
  "type": "camera_control",
  "command": "take_photo",
  "parameters": {}
}
```

#### 服务器 → 客户端

```javascript
// 欢迎消息
{
  "type": "welcome",
  "clientId": "client_abc123",
  "message": "成功连接到视频流服务器"
}

// 视频帧（发送给观看者）
{
  "type": "video_frame",
  "streamerId": "client_xyz789",
  "frameData": "base64编码的图片数据",
  "timestamp": 1640995200000,
  "frameNumber": 123
}

// 摄像头控制（发送给推流者）
{
  "type": "camera_control",
  "command": "take_photo",
  "parameters": {},
  "fromViewer": "client_viewer123"
}
```

### REST API

#### GET /api/video/status
获取视频流状态

**响应：**
```json
{
  "success": true,
  "data": {
    "isStreaming": true,
    "totalClients": 3,
    "viewerCount": 2,
    "streamerCount": 1
  }
}
```

#### POST /api/video/camera/control
发送摄像头控制命令

**请求：**
```json
{
  "command": "take_photo",
  "parameters": {}
}
```

**响应：**
```json
{
  "success": true,
  "message": "摄像头控制命令已发送",
  "command": "take_photo"
}
```

## 支持的摄像头控制命令

- `take_photo`: 拍照
- `start_streaming`: 开始推流
- `stop_streaming`: 停止推流

## 故障排除

### 常见问题

1. **WebSocket连接失败**
   - 检查后端服务器是否正常运行
   - 确认防火墙没有阻止端口5000
   - 在Android模拟器中使用`10.0.2.2`替代`localhost`

2. **摄像头无法启动**
   - 检查浏览器权限设置
   - 确认摄像头没有被其他应用占用
   - 尝试使用HTTPS访问（某些浏览器要求）

3. **视频流延迟过高**
   - 降低视频帧率（修改电脑端代码中的间隔时间）
   - 减少视频质量（调整JPEG压缩质量）
   - 检查网络连接状况

4. **Android APP无法显示视频**
   - 检查APP是否正确连接到WebSocket服务器
   - 确认VideoStreamViewer组件正确集成
   - 查看控制台日志了解详细错误信息

### 调试建议

1. **查看浏览器控制台**：电脑端模拟器的所有日志都会显示在浏览器控制台中
2. **查看服务器日志**：后端服务器会输出详细的连接和消息日志
3. **查看Android日志**：使用`adb logcat`或React Native Debugger查看APP日志

## 扩展功能

### 可能的改进方向

1. **视频质量优化**
   - 实现H.264编码
   - 自适应码率调整
   - 帧率动态调整

2. **多摄像头支持**
   - 支持前后摄像头切换
   - 多设备同时推流

3. **录制功能**
   - 服务器端录制视频流
   - 客户端录制功能

4. **音频支持**
   - 添加音频流传输
   - 音视频同步

5. **安全增强**
   - 添加用户认证
   - 数据加密传输

## 技术栈

- **前端（电脑端）**: HTML5 + JavaScript + WebRTC
- **移动端**: React Native + WebSocket
- **后端**: Node.js + Express + WebSocket (ws库)
- **协议**: WebSocket + HTTP REST API
- **视频编码**: JPEG (base64传输)

## 许可证

此项目仅供学习和开发参考使用。
