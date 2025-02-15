// SettingsButton.js
import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';

const SettingsButton = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.settingsButton}>
      {/* <Image source={require('./path/to/gear-icon.png')} style={styles.settingsIcon} /> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  settingsButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明背景
    borderRadius: 25,
  },
  settingsIcon: {
    width: 30,
    height: 30,
  },
});

export default SettingsButton;
