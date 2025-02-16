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
    alignItems: 'center',
    marginTop: -150, // 将整个方向键往上移动
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60, 
    height: 30, 
    backgroundColor: '#007bff',
    margin: 5,
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