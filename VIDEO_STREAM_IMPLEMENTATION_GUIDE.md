# 视频流实现使用指南

## 功能概述

该系统实现了从电脑摄像头到Android APP的实时视频流传输功能，包含以下组件：

1. **后端服务器** - 基于Node.js + WebSocket的视频流服务器
2. **网页推流器** - 网页版摄像头推流客户端  
3. **APP观看器** - React Native组件，用于接收和显示视频流

## 系统架构

```
电脑摄像头 → 网页推流器 → WebSocket服务器 → Android APP
```

## 快速开始

### 1. 启动后端服务器

```bash
cd BackEnd
npm install
npm start
```

服务器将在 `http://localhost:5000` 启动

### 2. 打开摄像头推流器

在浏览器中访问：`http://localhost:5000/camera-simulator/camera_streamer.html`

### 3. 操作步骤

1. **连接服务器** - 点击"连接服务器"按钮
2. **启动摄像头** - 点击"启动摄像头"按钮，允许浏览器访问摄像头
3. **开始推流** - 点击"开始推流"按钮开始传输视频

### 4. APP端观看

在Android APP中，VideoStreamViewer组件会自动连接到服务器并显示视频流。

## 网络配置

### 开发环境
- 后端服务器：`localhost:5000`
- WebSocket：`ws://localhost:5000/video-stream`

### 真机测试
需要将IP地址改为实际的服务器IP地址：

1. **修改APP连接地址**：
   ```javascript
   // 在 VideoStreamViewer.jsx 中修改
   const ws = new WebSocket('ws://YOUR_SERVER_IP:5000/video-stream');
   ```

2. **修改推流器连接地址**：
   ```javascript
   // 在 camera_streamer.html 中修改
   this.websocket = new WebSocket('ws://YOUR_SERVER_IP:5000/video-stream');
   ```

## API接口

### REST API

- `GET /api/video/status` - 获取视频流状态
- `POST /api/video/control` - 发送摄像头控制命令
- `GET /api/video/clients` - 获取连接的客户端列表

### WebSocket消息格式

#### 客户端 → 服务器

```javascript
// 注册为观看者
{
  "type": "join_as_viewer"
}

// 开始推流
{
  "type": "start_stream",
  "resolution": "1280x720",
  "fps": 30
}

// 发送视频帧
{
  "type": "video_frame",
  "frameData": "base64_encoded_image",
  "timestamp": 1234567890,
  "frameNumber": 123
}

// 摄像头控制
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
  "clientId": "client_xxx",
  "message": "成功连接到视频流服务器"
}

// 视频帧数据
{
  "type": "video_frame",
  "streamerId": "client_xxx",
  "frameData": "base64_encoded_image",
  "timestamp": 1234567890,
  "frameNumber": 123
}

// 流状态变化
{
  "type": "stream_started",
  "streamerId": "client_xxx",
  "streamInfo": {
    "resolution": "1280x720",
    "fps": 30,
    "codec": "JPEG"
  }
}
```

## 功能特性

### 推流器功能
- ✅ 摄像头访问和预览
- ✅ 实时视频帧捕获和传输
- ✅ 分辨率和帧率设置
- ✅ 连接状态监控
- ✅ 拍照功能
- ✅ 详细日志记录

### APP观看器功能
- ✅ 实时视频接收和显示
- ✅ 连接状态指示
- ✅ 视频信息显示（帧数、延迟）
- ✅ 摄像头远程控制
- ✅ 自动重连机制

### 服务器功能
- ✅ WebSocket连接管理
- ✅ 多客户端支持
- ✅ 消息路由和广播
- ✅ 客户端类型区分（推流者/观看者）
- ✅ REST API接口

## 故障排除

### 常见问题

1. **摄像头无法启动**
   - 检查浏览器权限设置
   - 确认摄像头未被其他应用占用
   - 尝试使用HTTPS访问（部分浏览器要求）

2. **WebSocket连接失败**
   - 检查服务器是否正常运行
   - 确认防火墙设置
   - 验证IP地址和端口配置

3. **APP无法接收视频**
   - 检查网络连接
   - 确认IP地址配置正确
   - 查看服务器日志

4. **视频延迟过高**
   - 降低分辨率和帧率
   - 检查网络带宽
   - 优化图像压缩质量

### 调试方法

1. **查看浏览器控制台** - 检查JavaScript错误和WebSocket连接状态
2. **查看服务器日志** - 观察连接和消息处理情况
3. **使用网络抓包工具** - 分析WebSocket数据传输
4. **检查APP日志** - 查看React Native控制台输出

## 性能优化

### 推流端优化
- 根据网络条件调整分辨率和帧率
- 优化图像压缩质量
- 实现自适应码率控制

### 服务器端优化
- 实现消息缓存和批处理
- 添加负载均衡支持
- 使用更高效的序列化格式

### 接收端优化
- 实现视频缓冲机制
- 添加丢帧处理逻辑
- 优化图像解码和渲染

## 扩展功能

### 计划添加的功能
- [ ] 音频传输支持
- [ ] 多路视频流支持
- [ ] 录制和回放功能
- [ ] 流媒体协议支持（RTMP/WebRTC）
- [ ] 移动端推流功能
- [ ] 用户认证和权限控制

## 技术栈

- **后端**: Node.js, Express, WebSocket (ws)
- **前端推流**: HTML5, Canvas, WebRTC APIs
- **移动端**: React Native
- **协议**: WebSocket, HTTP REST API
- **数据格式**: JSON, Base64编码图像

## 部署建议

### 开发环境
- 使用localhost进行本地测试
- 启用详细日志记录
- 使用较低分辨率以提高响应速度

### 生产环境
- 使用HTTPS和WSS加密传输
- 配置负载均衡和容错机制
- 实现监控和告警系统
- 优化网络和服务器性能
