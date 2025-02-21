import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Slider from '@react-native-community/slider';

const SettingsPage = ({ navigation, route }) => {
  const initialFontSize = route.params?.fontSize || 14; // 获取初始字体大小
  const [fontSize, setFontSize] = useState(initialFontSize);

  useEffect(() => {
    if (route.params?.fontSize) {
      setFontSize(route.params.fontSize);
    }
  }, [route.params?.fontSize]);

  const handleFontSizeChange = (value) => {
    setFontSize(value);
    navigation.setParams({ fontSize: value }); // 更新字体大小并传递给操作页面
  };

  const handleGoBack = () => {
    navigation.navigate('OperationScreen', { fontSize }); // 返回并传递字体大小
  };

  return (
    <View style={styles.container}>
      <View style={styles.columnContainer}>
        <TouchableOpacity style={styles.returnButton} onPress={handleGoBack}>
          <Image
            source={require('../public/Images/return.png')}
            style={styles.returnButtonImage}
          />
        </TouchableOpacity>
        <Text style={styles.label}>字号：</Text>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={30}
          step={1}
          value={fontSize}
          onValueChange={handleFontSizeChange}
          thumbTintColor="#FF5722"
          minimumTrackTintColor="#FF5722"
          maximumTrackTintColor="#FFFFFF"
          trackStyle={styles.trackStyle}
          thumbStyle={styles.thumbStyle}
        />
        <Text style={[styles.label, { fontSize }]}>当前字体大小: {fontSize}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // 透明背景
    padding: 20,
  },
  columnContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  returnButton: {
    width: 80,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  returnButtonImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 25,
    color: '#fff',
    marginBottom: 20,
  },
  slider: {
    width: 200,
    height: 40,
  },
  trackStyle: {
    height: 4,
    borderRadius: 2,
  },
  thumbStyle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF5722',
  },
});

export default SettingsPage;
