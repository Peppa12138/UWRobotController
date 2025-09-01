# 🤖 UW Robot Controller

一个基于React Native的移动端机器人控制应用，集成实时视频流传输、远程控制和多模式操作功能。

## 📋 项目概述

本项目是一个完整的机器人远程控制系统，包含：
- **Android移动应用** (React Native)：提供用户界面和控制功能
- **后端服务器** (Node.js + Express)：处理API请求和WebSocket连接
- **Web端推流器** (HTML5)：电脑摄像头模拟器，实现视频流推送
- **数据库** (MySQL)：用户认证和数据存储

## 🏗️ 系统架构

```
┌─────────────────┐     WebSocket      ┌─────────────────┐     WebSocket      ┌─────────────────┐
│   电脑摄像头    │ ◄─────────────────► │   后端服务器    │ ◄─────────────────► │   Android APP   │
│   推流器        │      视频流传输      │  (Node.js)      │      控制命令       │  (React Native) │
│ (camera_streamer│                     │                 │                     │                 │
│    .html)       │                     │                 │                     │                 │
└─────────────────┘                     └─────────────────┘                     └─────────────────┘
                                                │
                                                │ MySQL
                                                ▼
                                        ┌─────────────────┐
                                        │     数据库      │
                                        │   用户认证      │
                                        │   系统配置      │
                                        └─────────────────┘
```

## ⭐ 核心功能

### 📱 移动端 (React Native)
- **实时视频观看**：接收并显示来自电脑端的实时视频流
- **双模式控制**：
  - 🕹️ 虚拟摇杆：触摸屏虚拟摇杆控制
  - 🎮 物理摇杆：连接外部游戏手柄
- **操作控制面板**：
  - 方向控制按钮
  - 功能键组合
  - 浮动操作按钮
  - 网络状态监控
- **用户管理**：注册、登录、密码修改
- **设置界面**：控制模式切换、显示设置、录制功能

### 💻 后端服务器 (Node.js)
- **WebSocket服务**：实时双向通信，支持视频流和控制命令
- **REST API**：用户认证、状态查询、设备控制
- **多客户端管理**：区分推流者(streamer)和观看者(viewer)
- **数据库集成**：MySQL数据持久化
- **跨域支持**：CORS配置，支持不同域名访问

### 🌐 Web端推流器
- **摄像头控制**：启动/停止摄像头，多分辨率支持
- **实时推流**：WebSocket传输视频帧数据
- **远程控制响应**：接收来自APP的控制命令
- **状态监控**：连接状态、帧率、推流信息实时显示

## 🚀 快速开始

### 环境要求
- Node.js >= 14.0
- React Native CLI
- Android Studio (用于Android开发)
- MySQL数据库
- 现代浏览器 (支持WebRTC)

### 1. 克隆项目
```bash
git clone <repository-url>
cd UWRobotController
```

### 2. 安装依赖

#### 安装根目录依赖 (React Native)
```bash
npm install
# 或
yarn install
```

#### 安装后端依赖
```bash
cd BackEnd
npm install
```

### 3. 数据库配置
```bash
# 1. 创建MySQL数据库
mysql -u root -p
CREATE DATABASE robot_controller;
USE robot_controller;

# 2. 创建用户表
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# 3. 配置数据库连接
# 编辑 BackEnd/config/db.js 文件，设置数据库连接参数
```

### 4. 启动后端服务器
```bash
cd BackEnd
npm start
# 或
node app.js
```

服务器将在以下地址启动：
- HTTP API: `http://localhost:5000`
- WebSocket: `ws://localhost:5000/video-stream`

### 5. 启动Web推流器
在浏览器中访问：`http://localhost:5000/camera-simulator/camera_streamer.html`

1. 点击"连接服务器"
2. 点击"启动摄像头"（允许浏览器访问摄像头）
3. 点击"开始推流"

### 6. 启动Android应用

#### 开发环境
```bash
# 确保Android设备或模拟器已连接
npx react-native run-android
# 或
yarn android
# 或
npm run android
```

#### 生产构建
```bash
cd android
./gradlew assembleRelease
```

## 📚 API 文档

### REST API 接口

#### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/getUserInfo` - 获取用户信息

#### 视频流控制
- `GET /api/video/status` - 获取视频流状态
- `POST /api/video/control` - 发送摄像头控制命令

#### 系统状态
- `GET /api/status` - 获取服务器状态
- `GET /api/info` - 获取服务器信息

### WebSocket 消息格式

#### 客户端 → 服务器
```javascript
// 加入为观看者
{
  "type": "join_as_viewer"
}

// 开始推流
{
  "type": "start_stream",
  "resolution": "1280x720",
  "fps": 30,
  "codec": "JPEG"
}

// 视频帧数据
{
  "type": "video_frame",
  "frameData": "base64_encoded_image",
  "timestamp": 1640995200000,
  "frameNumber": 123
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

// 视频帧数据
{
  "type": "video_frame",
  "streamerId": "client_xyz789",
  "frameData": "base64_encoded_image",
  "timestamp": 1640995200000,
  "frameNumber": 123
}

// 流状态变化
{
  "type": "stream_started",
  "streamerId": "client_abc123",
  "streamInfo": {
    "resolution": "1280x720",
    "fps": 30,
    "codec": "JPEG"
  }
}
```

## 🛠️ 项目结构

```
UWRobotController/
│
├── 📱 Android App (React Native)
│   ├── App.jsx                     # 应用主入口
│   ├── FrontEnd/
│   │   ├── components/             # React组件
│   │   │   ├── AfterLogin/         # 登录后主界面
│   │   │   ├── CameraCatching/     # 摄像头捕获
│   │   │   ├── HomeSetting/        # 主设置页面
│   │   │   ├── Operations/         # 操作控制组件
│   │   │   │   ├── DirectionPad.jsx    # 方向控制板
│   │   │   │   ├── FunctionKeys.jsx    # 功能按键
│   │   │   │   ├── FloatingButton.jsx  # 浮动按钮
│   │   │   │   └── NetworkStatus.jsx   # 网络状态
│   │   │   ├── OperationScreen/    # 操作界面
│   │   │   ├── VideoStreamViewer/  # 视频流显示器
│   │   │   └── VirtualJoystick/    # 虚拟摇杆
│   │   ├── config/
│   │   │   └── NetworkConfig.js    # 网络配置
│   │   ├── router/
│   │   │   └── router.js           # 路由配置
│   │   └── utils/
│   │       └── IPDetector.js       # IP地址检测
│   └── android/                    # Android原生代码
│
├── 💻 Backend Server (Node.js)
│   ├── app.js                      # 主服务器文件
│   ├── app_simple.js               # 简化版服务器
│   ├── controllers/                # 控制器
│   │   ├── authController.js       # 用户认证
│   │   ├── statusController.js     # 状态管理
│   │   └── videoStreamController.js # 视频流控制
│   ├── routes/                     # 路由定义
│   │   ├── authRoutes.js           # 认证路由
│   │   ├── statusRoutes.js         # 状态路由
│   │   └── videoStreamRoutes.js    # 视频流路由
│   └── config/
│       └── db.js                   # 数据库配置
│
├── 🌐 Web Streamer
│   ├── camera_streamer.html        # 摄像头推流器
│   ├── camera_simulator.html       # 摄像头模拟器
│   └── app_connection_test.html    # 连接测试页面
│
├── 📄 Configuration Files
│   ├── package.json                # 项目依赖
│   ├── babel.config.js             # Babel配置
│   ├── metro.config.js             # Metro打包配置
│   └── react-native.config.js     # RN配置
│
└── 📚 Documentation
    └── README.md                   # 项目文档
```

## 🌐 网络配置

### 开发环境
- 服务器地址：`localhost:5000`
- WebSocket地址：`ws://localhost:5000/video-stream`

### Android模拟器环境
```javascript
// 在 IPDetector.js 中自动检测
{
  WEBSOCKET_URL: 'ws://10.0.2.2:5000/video-stream',
  API_BASE_URL: 'http://10.0.2.2:5000/api'
}
```

### 真机测试环境
```javascript
// 需要使用实际IP地址
{
  WEBSOCKET_URL: 'ws://192.168.1.100:5000/video-stream',
  API_BASE_URL: 'http://192.168.1.100:5000/api'
}
```

## 🔧 功能配置

### 视频流设置
- **分辨率选项**：640x480, 1280x720, 1920x1080
- **帧率选项**：15 FPS, 30 FPS, 60 FPS
- **编码格式**：JPEG (Base64传输)

### 控制设置
- **虚拟摇杆**：触摸屏操作，支持方向和力度检测
- **物理摇杆**：外接游戏手柄支持
- **方向控制**：上下左右按钮
- **功能键**：自定义功能按钮

### 性能优化
- **自适应画质**：根据网络状况自动调整
- **缓冲管理**：视频帧缓冲优化
- **连接恢复**：自动重连机制

## 🛠️ 故障排除

### 常见问题

#### 1. WebSocket连接失败
**症状**：APP无法连接到服务器
**解决方案**：
- 检查后端服务器是否正常运行
- 确认防火墙没有阻止端口5000
- Android模拟器使用`10.0.2.2`替代`localhost`
- 检查IP地址配置是否正确

#### 2. 摄像头无法启动
**症状**：Web推流器无法访问摄像头
**解决方案**：
- 检查浏览器权限设置
- 确认摄像头没有被其他应用占用
- 尝试使用HTTPS访问（部分浏览器要求）
- 检查浏览器兼容性

#### 3. 视频画面不显示
**症状**：APP连接成功但看不到视频
**解决方案**：
- 确认Web端推流器正在运行
- 检查浏览器控制台错误信息
- 查看APP调试日志
- 验证WebSocket消息传输

#### 4. 视频延迟过高
**症状**：视频画面延迟明显
**解决方案**：
- 降低推流器分辨率和帧率
- 检查网络带宽和稳定性
- 优化JPEG压缩质量
- 使用有线网络连接

#### 5. 数据库连接失败
**症状**：用户认证功能异常
**解决方案**：
- 检查MySQL服务是否运行
- 验证数据库配置信息
- 确认用户表已正确创建
- 检查数据库权限设置

### 调试方法

#### 1. 后端调试
```bash
# 查看服务器日志
cd BackEnd
npm start

# 测试API接口
curl http://localhost:5000/api/video/status
```

#### 2. 前端调试
```bash
# React Native调试
npx react-native log-android

# 网络抓包
# 使用Chrome DevTools或Flipper查看网络请求
```

#### 3. WebSocket调试
```javascript
// 在浏览器控制台测试WebSocket连接
const ws = new WebSocket('ws://localhost:5000/video-stream');
ws.onopen = () => console.log('连接成功');
ws.onmessage = (event) => console.log('收到消息:', event.data);
```

## 📈 性能优化建议

### 网络优化
- 使用有线网络连接（如可能）
- 确保Wi-Fi信号强度良好
- 减少同网络其他设备带宽占用
- 考虑使用CDN加速静态资源

### 应用优化
- 实现视频帧缓冲机制
- 添加网络状态自适应
- 优化React Native性能
- 减少不必要的组件重渲染

### 服务器优化
- 实现负载均衡
- 添加Redis缓存
- 优化数据库查询
- 实现消息队列

## 🔄 开发工作流

### 开发环境设置
1. 启动后端服务器：`cd BackEnd && npm start`
2. 启动Web推流器：访问 `http://localhost:5000/camera-simulator/camera_streamer.html`
3. 启动React Native：`npx react-native run-android`

### 代码提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建工具或辅助工具变动

### 测试策略
- 单元测试：Jest + React Native Testing Library
- 集成测试：API接口测试
- 端到端测试：真机测试验证
- 性能测试：网络延迟和视频质量测试

## 📝 更新日志

### v1.0.0 (当前版本)
- ✅ 实现基础视频流传输功能
- ✅ 完成用户认证系统
- ✅ 实现虚拟摇杆控制
- ✅ 添加多环境网络配置
- ✅ 完成Android AVD兼容性修复
- ✅ 实现WebSocket双向通信

### 计划中的功能
- 🔄 音频传输支持
- 🔄 双向通话功能
- 🔄 录制和回放功能
- 🔄 多设备同时连接
- 🔄 iOS应用支持
- 🔄 云端部署方案

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork项目仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add some amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看[LICENSE](LICENSE)文件了解详情。

## 👨‍💻 开发团队

- **项目维护者**：[Your Name]
- **贡献者**：查看[CONTRIBUTORS.md](CONTRIBUTORS.md)

## 📞 支持与反馈

如有问题或建议，请通过以下方式联系：
- 📧 邮箱：your-email@example.com
- 🐛 问题报告：[GitHub Issues](https://github.com/your-repo/issues)
- 💬 讨论：[GitHub Discussions](https://github.com/your-repo/discussions)

---

**享受机器人控制的乐趣！** 🚀🤖
