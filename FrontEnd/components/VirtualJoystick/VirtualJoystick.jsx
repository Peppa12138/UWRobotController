import React, { useRef } from 'react';
import { View, PanResponder, StyleSheet, Text, Animated } from 'react-native';

const VirtualJoystick = ({ onMove }) => {
  const joystickRadius = 50; // 摇杆背景半径
  const minStickRadius = 10; // 摇杆按钮最小半径
  const maxStickRadius = 20; // 摇杆按钮最大半径
  const maxDistance = joystickRadius - minStickRadius; // 最大偏移范围
  const activationDistance = joystickRadius * 3; // 手指离摇杆的最大有效距离

  const animatedPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current; // 用于动画的位置
  const animatedRadius = useRef(new Animated.Value(minStickRadius)).current; // 用于动画的半径
  const joystickRef = useRef(null);

  // 平滑返回中心位置的动画
  const animateStickToCenter = () => {
    Animated.parallel([
      Animated.spring(animatedPosition, {
        toValue: { x: 0, y: 0 },
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
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
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
            animatedPosition.setValue({ x: offsetX, y: offsetY });
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
        // 释放时平滑返回中心位置
        animateStickToCenter();
        if (onMove) {
          onMove({ x: 0, y: 0, distance: 0 });
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
          { width: joystickRadius * 2, height: joystickRadius * 2 },
        ]}
        {...panResponder.panHandlers}
        ref={joystickRef}
      >
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
                { translateX: animatedPosition.x },
                { translateY: animatedPosition.y },
              ],
            },
          ]}
        />
      </View>
      {/* 可选的文本，显示方向 */}
      <Text style={styles.directionText}>
        X: {animatedPosition.x._value.toFixed(2)}, Y:{' '}
        {animatedPosition.y._value.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  joystickContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 100, // Optional, make sure it's not off-screen
  },
  joystickBackground: {
    position: 'relative',
    borderRadius: 100,
    backgroundColor: '#ddd', // 背景颜色
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, // 边框
    borderColor: '#333', // 边框颜色
  },
  stick: {
    position: 'absolute',
    backgroundColor: '#008CBA', // 摇杆按钮的颜色
  },
  directionText: {
    marginTop: 40,
    fontSize: 14,
    color: '#fff',
  },
});

export default VirtualJoystick;