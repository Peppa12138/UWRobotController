@echo off
echo ================================
echo 视频流系统启动脚本
echo ================================
echo.

echo 正在检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo Node.js环境检查通过
echo.

echo 正在启动后端服务器...
cd /d "%~dp0BackEnd"

echo 检查依赖包...
if not exist "node_modules" (
    echo 正在安装依赖包...
    npm install
    if %errorlevel% neq 0 (
        echo 错误：依赖包安装失败
        pause
        exit /b 1
    )
)

echo.
echo ================================
echo 服务器即将启动
echo ================================
echo 摄像头推流器地址: http://localhost:5000/camera-simulator/camera_streamer.html
echo WebSocket地址: ws://localhost:5000/video-stream
echo API接口地址: http://localhost:5000/api/video
echo.
echo 启动后请：
echo 1. 在浏览器中打开推流器地址
echo 2. 点击"连接服务器" - "启动摄像头" - "开始推流"
echo 3. 在APP中查看视频流
echo.
echo 按Ctrl+C停止服务器
echo ================================
echo.

npm start
