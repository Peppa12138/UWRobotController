import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const SettingsPage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>设置</Text>
      <TouchableOpacity style={styles.settingItem} onPress={() => alert('点击了音效设置')}>
        <Text style={styles.settingText}>音效</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} onPress={() => alert('点击了画面设置')}>
        <Text style={styles.settingText}>画面</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} onPress={() => alert('点击了操作设置')}>
        <Text style={styles.settingText}>操作</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.goBack()}>
        <Text style={styles.settingText}>返回</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingText: {
    fontSize: 18,
    color: '#000',
  },
});

export default SettingsPage;