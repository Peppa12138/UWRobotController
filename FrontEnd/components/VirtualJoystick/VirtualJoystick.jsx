import React, {useRef, useEffect} from 'react';
import {View, PanResponder, StyleSheet, Text, Animated, Image, DeviceEventEmitter} from 'react-native';

const VirtualJoystick = ({
  onMove, 
  gamepadPosition = {x: 0, y: 0}, 
  gamepadEnabled = false
}) => {
  const joystickRadius = 70; // 增大摇杆背景半径
  const minStickRadius = 12; // 稍微增大摇杆按钮最小半径
  const maxStickRadius = 25; // 稍微增大摇杆按钮最大半径
  const maxDistance = joystickRadius - minStickRadius; // 最大偏移范围
  const activationDistance = joystickRadius * 3; // 手指离摇杆的最大有效距离

  const animatedPosition = useRef(new Animated.ValueXY({x: 0, y: 0})).current; // 用于动画的位置
  const animatedRadius = useRef(new Animated.Value(minStickRadius)).current; // 用于动画的半径
  const joystickRef = useRef(null);

  // 手柄同步：当手柄位置改变时，更新虚拟摇杆位置
  useEffect(() => {
    if (gamepadEnabled && gamepadPosition) {
      const {x, y} = gamepadPosition;
      
      // 限制在摇杆范围内
      const distance = Math.sqrt(x * x + y * y);
      const maxRadius = joystickRadius - minStickRadius;
      
      if (distance > 0) {
        const limitedX = distance > maxRadius ? (x / distance) * maxRadius : x;
        const limitedY = distance > maxRadius ? (y / distance) * maxRadius : y;
        
        // 平滑更新位置
        Animated.spring(animatedPosition, {
          toValue: {x: limitedX, y: limitedY},
          friction: 8,
          tension: 100,
          useNativeDriver: false,
        }).start();
        
        // 更新半径
        const newRadius = minStickRadius + (Math.min(distance, maxRadius) / maxRadius) * (maxStickRadius - minStickRadius);
        Animated.spring(animatedRadius, {
          toValue: newRadius,
          friction: 8,
          useNativeDriver: false,
        }).start();
        
        // 调用回调
        if (onMove) {
          onMove({
            x: limitedX / joystickRadius,
            y: limitedY / joystickRadius,
            distance: Math.min(distance, maxRadius) / maxRadius,
          });
        }
      } else {
        // 回到中心
        animateStickToCenter();
        if (onMove) {
          onMove({x: 0, y: 0, distance: 0});
        }
      }
    }
  }, [gamepadPosition, gamepadEnabled, joystickRadius, minStickRadius, maxStickRadius, onMove]);

  // 监听手柄同步事件
  useEffect(() => {
    if (!gamepadEnabled) {
      return;
    }

    const syncListener = DeviceEventEmitter.addListener('virtualJoystickSync', (event) => {
      const { stick, data, source } = event;
      
      if (stick === 'left' && source === 'gamesir_x2s') {
        // 手柄数据已经在gamepadPosition中处理了
        console.log('VirtualJoystick: 接收到手柄同步数据');
      }
    });

    return () => {
      syncListener.remove();
    };
  }, [gamepadEnabled]);

  // 平滑返回中心位置的动画
  const animateStickToCenter = () => {
    Animated.parallel([
      Animated.spring(animatedPosition, {
        toValue: {x: 0, y: 0},
        friction: 5, // 控制动画的平滑度
        useNativeDriver: false,
      }),
      Animated.spring(animatedRadius, {
        toValue: minStickRadius,
        friction: 5,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !gamepadEnabled, // 手柄模式时禁用触摸
      onMoveShouldSetPanResponder: () => !gamepadEnabled,  // 手柄模式时禁用触摸
      onPanResponderMove: (e, gestureState) => {
        // 如果手柄已启用，忽略触摸输入
        if (gamepadEnabled) {
          return;
        }
        
        // 获取摇杆背景的绝对位置
        joystickRef.current.measure((x, y, width, height, pageX, pageY) => {
          const offsetX = gestureState.moveX - pageX - joystickRadius;
          const offsetY = gestureState.moveY - pageY - joystickRadius;

          // 计算与原点的距离
          const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

          // 如果手指离摇杆中心太远，则忽略此次移动
          if (distance > activationDistance) {
            return;
          }

          if (distance <= maxDistance) {
            // 在范围内，直接更新位置和半径
            animatedPosition.setValue({x: offsetX, y: offsetY});
            const newRadius =
              minStickRadius +
              (distance / maxDistance) * (maxStickRadius - minStickRadius);
            animatedRadius.setValue(newRadius);
          } else {
            // 超出范围，限制在最大距离内
            const angle = Math.atan2(offsetY, offsetX);
            animatedPosition.setValue({
              x: Math.cos(angle) * maxDistance,
              y: Math.sin(angle) * maxDistance,
            });
            animatedRadius.setValue(maxStickRadius); // 拉到边缘时，半径最大
          }

          // 传递摇杆的偏移量 (方向和力度)
          if (onMove) {
            onMove({
              x: offsetX / joystickRadius,
              y: offsetY / joystickRadius,
              distance: Math.min(distance, maxDistance) / maxDistance,
            });
          }
        });
      },
      onPanResponderRelease: () => {
        // 如果手柄已启用，忽略触摸输入
        if (gamepadEnabled) {
          return;
        }
        
        // 释放时平滑返回中心位置
        animateStickToCenter();
        if (onMove) {
          onMove({x: 0, y: 0, distance: 0});
        }
      },
    }),
  ).current;

  return (
    <View style={styles.joystickContainer}>
      {/* 摇杆背景 */}
      <View
        style={[
          styles.joystickBackground,
          {width: joystickRadius * 2, height: joystickRadius * 2},
        ]}
        {...panResponder.panHandlers}
        ref={joystickRef}>
        
        {/* 添加同心圆装饰 */}
        <View style={[
          styles.innerCircle, 
          {
            width: joystickRadius * 1.4, 
            height: joystickRadius * 1.4,
            borderRadius: joystickRadius * 0.7,
          }
        ]} />
        <View style={[
          styles.innerCircle2, 
          {
            width: joystickRadius * 0.8, 
            height: joystickRadius * 0.8,
            borderRadius: joystickRadius * 0.4,
          }
        ]} />

        {/* 添加四个方向按钮 */}
        {/* 上按钮 */}
        <Image
          source={require('../public/Images/virtual-up.png')}
          style={[
            styles.directionButton,
            {
              top: 8, // 距离顶部8px
              left: joystickRadius - 17, // 水平居中 (半径-按钮宽度的一半)
            }
          ]}
        />
        
        {/* 下按钮 */}
        <Image
          source={require('../public/Images/virtual-down.png')}
          style={[
            styles.directionButton,
            {
              bottom: 8, // 距离底部8px
              left: joystickRadius - 17, // 与上按钮水平对齐
            }
          ]}
        />
        
        {/* 左按钮 */}
        <Image
          source={require('../public/Images/virtual-left.png')}
          style={[
            styles.directionButton,
            {
              top: joystickRadius - 14, // 垂直居中 (半径-按钮高度的一半)
              left: 8, // 距离左边8px
            }
          ]}
        />
        
        {/* 右按钮 */}
        <Image
          source={require('../public/Images/virtual-right.png')}
          style={[
            styles.directionButton,
            {
              top: joystickRadius - 14, // 与左按钮垂直对齐
              right: 8, // 距离右边8px
            }
          ]}
        />

        {/* 摇杆控制按钮 */}
        <Animated.View
          style={[
            styles.stick,
            {
              width: animatedRadius.interpolate({
                inputRange: [minStickRadius, maxStickRadius],
                outputRange: [minStickRadius * 2, maxStickRadius * 2],
              }),
              height: animatedRadius.interpolate({
                inputRange: [minStickRadius, maxStickRadius],
                outputRange: [minStickRadius * 2, maxStickRadius * 2],
              }),
              borderRadius: animatedRadius.interpolate({
                inputRange: [minStickRadius, maxStickRadius],
                outputRange: [minStickRadius, maxStickRadius],
              }),
              transform: [
                {translateX: animatedPosition.x},
                {translateY: animatedPosition.y},
              ],
            },
          ]}
        >
          {/* 添加内部高光效果 */}
          <Animated.View
            style={[
              styles.stickInnerHighlight,
              {
                width: animatedRadius.interpolate({
                  inputRange: [minStickRadius, maxStickRadius],
                  outputRange: [minStickRadius * 1.2, maxStickRadius * 1.2],
                }),
                height: animatedRadius.interpolate({
                  inputRange: [minStickRadius, maxStickRadius],
                  outputRange: [minStickRadius * 1.2, maxStickRadius * 1.2],
                }),
                borderRadius: animatedRadius.interpolate({
                  inputRange: [minStickRadius, maxStickRadius],
                  outputRange: [minStickRadius * 0.6, maxStickRadius * 0.6],
                }),
              },
            ]}
          />
        </Animated.View>
      </View>
      {/* 可选的文本，显示方向
      <Text style={styles.directionText}>
        X: {animatedPosition.x._value.toFixed(2)}, Y:{' '}
        {animatedPosition.y._value.toFixed(2)}
      </Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  joystickContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    marginTop: -180, // 从-150改为-180，向上移动30像素
  },
  joystickBackground: {
    position: 'relative',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // 半透明白色背景
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, // 添加边框
    borderColor: 'rgba(255, 255, 255, 0.3)', // 半透明白色边框
    shadowColor: '#000', // 添加阴影效果
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8, // Android 阴影
  },
  innerCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // 非常淡的圆环
    backgroundColor: 'transparent',
  },
  innerCircle2: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // 更淡的圆环
    backgroundColor: 'transparent',
  },
  directionButton: {
    position: 'absolute',
    width: 28, // 从20增加到28，调大图片尺寸
    height: 28, // 从20增加到28
    resizeMode: 'contain',
    opacity: 0.7, // 半透明效果，不会过于突出
    zIndex: 1, // 确保在装饰圆环之上
  },
  stick: {
    position: 'absolute',
    backgroundColor: '#4A90E2', // 更现代的蓝色
    borderRadius: 20, // 保证是圆形
    borderWidth: 2, // 摇杆按钮边框
    borderColor: 'rgba(255, 255, 255, 0.8)', // 白色边框
    shadowColor: '#000', // 摇杆按钮阴影
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 6, // Android 阴影
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickInnerHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // 半透明白色高光
    top: '20%', // 位置偏上，模拟光源效果
    left: '20%',
  },
  directionText: {
    marginTop: 40,
    fontSize: 14,
    color: '#fff',
  },
});

export default VirtualJoystick;
