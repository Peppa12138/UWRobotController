import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const VideoStats = ({progress, frameRate}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Progress: {progress.toFixed(0)}s
      </Text>
      <Text style={styles.text}>
        Frame Rate: {frameRate !== null ? frameRate.toFixed(2) + ' fps' : 'Calculating...'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: height * 0.3,
    right: width * 0.02,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
});

export default VideoStats;
