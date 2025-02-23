import React, {useState, useRef} from 'react';
import {View, PanResponder, StyleSheet, Text} from 'react-native';

const VirtualJoystick = ({onMove}) => {
  const [stickPosition, setStickPosition] = useState({x: 0, y: 0});
  const [stickRadius, setStickRadius] = useState(10); // 初始摇杆控制按钮半径
  const joystickRadius = 50; // 摇杆背景半径
  const joystickRef = useRef(null);

  // 计算摇杆的最大偏移范围
  const maxDistance = joystickRadius - stickRadius;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const offsetX = gestureState.moveX - joystickRadius;
        const offsetY = gestureState.moveY - joystickRadius;

        // 计算与原点的距离
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

        // 限制摇杆控制按钮的移动范围
        if (distance <= maxDistance) {
          setStickPosition({x: offsetX, y: offsetY});

          // 使用距离计算力度并映射到一个范围来调整按钮半径
          const maxStickRadius = 15; // 最大半径
          const minStickRadius = 12; // 最小半径

          // 将力度（distance/maxDistance）映射到一个合理范围内的半径
          const newRadius =
            minStickRadius +
            (distance / maxDistance) * (maxStickRadius - minStickRadius);
          setStickRadius(newRadius);
        } else {
          const angle = Math.atan2(offsetY, offsetX);
          setStickPosition({
            x: Math.cos(angle) * maxDistance,
            y: Math.sin(angle) * maxDistance,
          });
          setStickRadius(30); // 最大力度时，半径恢复初始大小
        }

        // 传递摇杆的偏移量 (方向和力度)
        if (onMove) {
          onMove({
            x: offsetX / joystickRadius,
            y: offsetY / joystickRadius,
            distance: Math.min(distance, maxDistance) / maxDistance,
          });
        }
      },
      onPanResponderRelease: () => {
        // 重置摇杆到中心位置
        setStickPosition({x: 0, y: 0});
        setStickRadius(10); // 恢复到初始半径
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
        {/* 摇杆控制按钮 */}
        <View
          style={[
            styles.stick,
            {
              width: stickRadius * 2,
              height: stickRadius * 2,
              left: joystickRadius + stickPosition.x - stickRadius,
              top: joystickRadius + stickPosition.y - stickRadius,
            },
          ]}
        />
      </View>
      {/* 可选的文本，显示方向 */}
      <Text style={styles.directionText}>
        X: {stickPosition.x.toFixed(2)}, Y: {stickPosition.y.toFixed(2)}
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
    backgroundColor: '#ddd', // Add background color for visibility
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, // Optional: add a border for visibility
    borderColor: '#333', // Optional: border color to make it visible
  },
  stick: {
    position: 'absolute',
    borderRadius: 30,
    backgroundColor: '#008CBA', // 摇杆按钮的颜色
  },
  directionText: {
    marginTop: 40,
    fontSize: 14,
    color: '#fff',
  },
});

export default VirtualJoystick;
