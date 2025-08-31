#!/usr/bin/env python3
"""
测试WebSocket视频流连接和数据接收
"""

import websocket
import json
import base64
import time
from datetime import datetime

# WebSocket服务器URL
WS_URL = "ws://192.168.56.1:5000/video-stream"

# 全局变量
frame_count = 0
start_time = None
last_frame_time = None

def on_message(ws, message):
    global frame_count, start_time, last_frame_time
    
    try:
        data = json.loads(message)
        current_time = time.time()
        
        if data.get('type') == 'video_frame':
            frame_count += 1
            
            if start_time is None:
                start_time = current_time
            
            frame_data = data.get('frameData', '')
            frame_number = data.get('frameNumber', 0)
            timestamp = data.get('timestamp', current_time * 1000)
            
            # 计算FPS
            if last_frame_time:
                fps = 1.0 / (current_time - last_frame_time)
            else:
                fps = 0
                
            last_frame_time = current_time
            
            # 验证base64数据
            try:
                if frame_data:
                    # 移除可能的前缀
                    clean_data = frame_data.replace('data:image/jpeg;base64,', '')
                    
                    # 尝试解码base64
                    decoded = base64.b64decode(clean_data)
                    
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] "
                          f"帧 #{frame_number} | "
                          f"FPS: {fps:.1f} | "
                          f"Base64长度: {len(clean_data)} | "
                          f"解码后大小: {len(decoded)} bytes | "
                          f"JPEG头: {decoded[:4].hex() if len(decoded) >= 4 else 'N/A'}")
                    
                    # 验证JPEG格式
                    if len(decoded) >= 4:
                        jpeg_signature = decoded[:4]
                        if jpeg_signature[:2] == b'\xff\xd8':
                            print(f"  ✓ 有效的JPEG数据")
                        else:
                            print(f"  ✗ 无效的JPEG数据，头部: {jpeg_signature.hex()}")
                    
                    # 每100帧统计一次
                    if frame_count % 100 == 0:
                        elapsed = current_time - start_time
                        avg_fps = frame_count / elapsed
                        print(f"\n=== 统计信息 ===")
                        print(f"总帧数: {frame_count}")
                        print(f"运行时间: {elapsed:.1f}s")
                        print(f"平均FPS: {avg_fps:.1f}")
                        print(f"================\n")
                    
                else:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] 帧 #{frame_number} - 空数据")
                    
            except Exception as decode_error:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] "
                      f"帧 #{frame_number} - Base64解码错误: {decode_error}")
                      
        elif data.get('type') == 'welcome':
            print(f"收到欢迎消息: {data.get('message', '')}")
            
        elif data.get('type') == 'viewer_joined':
            print(f"成功加入为观看者，当前流状态: {data.get('isStreaming', False)}")
            
        else:
            print(f"其他消息类型: {data.get('type', 'unknown')}")
            
    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")
    except Exception as e:
        print(f"处理消息时出错: {e}")

def on_error(ws, error):
    print(f"WebSocket错误: {error}")

def on_close(ws, close_status_code, close_msg):
    print(f"WebSocket连接关闭. 状态码: {close_status_code}, 消息: {close_msg}")

def on_open(ws):
    print(f"WebSocket连接已建立到: {WS_URL}")
    
    # 发送加入观看者请求
    join_message = {
        "type": "join_viewer",
        "clientId": f"test_client_{int(time.time())}"
    }
    ws.send(json.dumps(join_message))
    print("已发送加入观看者请求")

def main():
    print("开始测试WebSocket视频流连接...")
    print(f"连接URL: {WS_URL}")
    print("按 Ctrl+C 停止测试\n")
    
    # 创建WebSocket连接
    ws = websocket.WebSocketApp(
        WS_URL,
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    
    try:
        # 启动连接
        ws.run_forever()
    except KeyboardInterrupt:
        print("\n用户停止测试")
        ws.close()
    except Exception as e:
        print(f"运行错误: {e}")

if __name__ == "__main__":
    main()
