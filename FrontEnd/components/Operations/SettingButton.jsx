import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Icon } from '@ant-design/react-native';
import {
  outlineGlyphMap,
  OutlineGlyphMapType,
} from '@ant-design/icons-react-native/lib/outline';
const SettingsButton = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.settingsButton}>
      <Icon name="setting" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  settingsButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // 半透明背景
    borderRadius: 25,
  },
  settingsIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain', // 确保图片按比例缩放
  },
});

export default SettingsButton;