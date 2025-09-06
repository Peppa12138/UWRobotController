import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import { useFontSize } from '../../utils/useFontSize';

const {width, height} = Dimensions.get('window');

const VideoStats = ({progress, frameRate}) => {
  const fontSize = useFontSize();
  
  return (
    <View style={styles.container}>
      <Text style={[styles.text, {fontSize}]}>
        Progress: {progress.toFixed(0)}s
      </Text>
      <Text style={[styles.text, {fontSize}]}>
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
    color: 'white',
    marginBottom: 5,
    // fontSize 现在由组件动态设置
  },
});

export default VideoStats;
