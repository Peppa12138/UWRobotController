import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

const DirectionPad = ({ onPress }) => {
  return (
    <View style={styles.directionPad}>
      <TouchableOpacity
        style={[styles.button, styles.upButton]}
        onPress={() => onPress('up')}
      >
        <Text style={styles.buttonText}>上</Text>
      </TouchableOpacity>
      <View style={styles.middleRow}>
        <TouchableOpacity
          style={[styles.button, styles.leftButton]}
          onPress={() => onPress('left')}
        >
          <Text style={styles.buttonText}>左</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.rightButton]}
          onPress={() => onPress('right')}
        >
          <Text style={styles.buttonText}>右</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.button, styles.downButton]}
        onPress={() => onPress('down')}
      >
        <Text style={styles.buttonText}>下</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  directionPad: {
    // alignItems: 'center',
    alignItems: 'flex-start', // 横屏时靠左显示
    justifyContent: 'flex-end', // 横屏时靠下显示
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,  // 调整宽度，使按钮更长
    height: 40, // 调整高度，形成长方形
    backgroundColor: '#007bff',
    margin: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  upButton: {
    alignSelf: 'center',
  },
  downButton: {
    alignSelf: 'center',
  },
  middleRow: {
    flexDirection: 'row',
  },
  leftButton: {
    marginRight: 20,
  },
  rightButton: {
    marginLeft: 20,
  },
});

export default DirectionPad;