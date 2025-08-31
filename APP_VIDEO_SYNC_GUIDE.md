# 📱 Android APP视频流同步指南

## 🎯 实现目标
将电脑摄像头的实时画面同步显示到Android APP中

## 🔧 已完成的配置

### 1. 网络配置
- **服务器IP**: `192.168.56.1`
- **服务器端口**: `5000`
- **WebSocket地址**: `ws://192.168.56.1:5000/video-stream`

### 2. 组件更新
- ✅ 更新了 `VideoStreamViewer.jsx` 使用正确的IP地址
- ✅ 创建了网络配置文件 `NetworkConfig.js`
- ✅ 创建了测试页面 `VideoStreamTestPage.jsx`

## 🚀 使用步骤

### 第1步：启动后端服务器
```bash
cd BackEnd
node app.js
```

看到以下信息表示启动成功：
```
服务器正在运行，端口号: 5000
局域网访问地址: http://192.168.56.1:5000
WebSocket地址: ws://192.168.56.1:5000/video-stream
```

### 第2步：启动电脑端推流器
1. 在浏览器中访问：`http://localhost:5000/camera-simulator/camera_streamer.html`
2. 点击"连接服务器"
3. 点击"启动摄像头"（允许浏览器访问摄像头）
4. 点击"开始推流"

### 第3步：在APP中查看
1. 在React Native项目中导入和使用 `VideoStreamTestPage` 组件
2. 或者直接使用 `VideoStreamViewer` 组件

## 📱 APP端集成方法

### 方法1：使用测试页面
```jsx
import VideoStreamTestPage from './components/VideoStreamTestPage/VideoStreamTestPage';

// 在你的导航器或主组件中
<VideoStreamTestPage />
```

### 方法2：直接使用VideoStreamViewer
```jsx
import VideoStreamViewer from './components/VideoStreamViewer/VideoStreamViewer';

const MyComponent = () => {
  const handleCameraControl = (command, parameters) => {
    console.log('摄像头控制:', command, parameters);
  };

  return (
    <View style={{ flex: 1 }}>
      <VideoStreamViewer onCameraControl={handleCameraControl} />
    </View>
  );
};
```

## 🌐 网络环境配置

### 开发环境（推荐）
```javascript
// 在 NetworkConfig.js 中
DEVELOPMENT: {
  WEBSOCKET_URL: 'ws://192.168.56.1:5000/video-stream',
  API_BASE_URL: 'http://192.168.56.1:5000/api',
}
```

### Android模拟器
```javascript
EMULATOR: {
  WEBSOCKET_URL: 'ws://10.0.2.2:5000/video-stream',
  API_BASE_URL: 'http://10.0.2.2:5000/api',
}
```

### 真机测试
确保手机和电脑在同一Wi-Fi网络下，使用实际IP地址。

## 🔍 故障排除

### 问题1：APP无法连接到服务器
**解决方案：**
1. 确认电脑和手机在同一网络
2. 检查防火墙设置，允许端口5000
3. 验证IP地址是否正确

### 问题2：视频画面不显示
**解决方案：**
1. 确认电脑端推流器正在运行
2. 检查浏览器控制台是否有错误
3. 查看APP的调试日志

### 问题3：视频延迟很高
**解决方案：**
1. 降低推流器的分辨率和帧率
2. 检查网络带宽
3. 确保网络连接稳定

## 📊 监控和调试

### 服务器端监控
```bash
# 查看WebSocket连接数
curl http://192.168.56.1:5000/api/video/status

# 查看连接的客户端
curl http://192.168.56.1:5000/api/video/clients
```

### APP端调试
在 `VideoStreamViewer.jsx` 中查看console日志：
- 连接状态变化
- 接收到的视频帧信息
- WebSocket消息

## ⚡ 性能优化建议

### 1. 网络优化
- 使用有线网络连接（如果可能）
- 确保Wi-Fi信号强度良好
- 减少同网络其他设备的带宽占用

### 2. 推流设置优化
- **分辨率**: 建议使用1280x720而不是1920x1080
- **帧率**: 建议使用15-30 FPS
- **压缩质量**: 调整JPEG压缩质量平衡清晰度和延迟

### 3. APP端优化
- 实现帧缓冲机制
- 添加网络状态检测
- 实现自动重连功能

## 🎉 成功标志

当一切配置正确时，你应该能看到：
1. ✅ 电脑端推流器显示摄像头画面并显示"正在推流"
2. ✅ APP端显示实时视频画面
3. ✅ 视频延迟在1-3秒以内（取决于网络条件）
4. ✅ 连接状态指示器显示"已连接"和"LIVE"

## 📞 下一步

一旦基本功能正常工作，你可以考虑：
- 添加音频传输
- 实现双向通话功能
- 添加录制功能
- 优化移动端用户界面
- 实现多设备连接
