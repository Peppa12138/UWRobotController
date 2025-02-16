import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

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
      {/* 修改返回按钮的样式 */}
      <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
        <Text style={styles.returnButtonText}>返回</Text>
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
    elevation: 2, // 为 Android 添加阴影
  },
  settingText: {
    fontSize: 18,
    color: '#000',
  },
  returnButton: {
    width: 100, // 缩小按钮宽度
    height: 40, // 缩小按钮高度
    backgroundColor: '#ccc', // 更淡的背景颜色
    borderRadius: 5, // 更小的圆角
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80, // 距离上一个按钮的间距
    shadowColor: '#000', // 阴影颜色
    shadowOffset: { width: 0, height: 2 }, // 阴影偏移量
    shadowOpacity: 0.2, // 阴影透明度
    shadowRadius: 4, // 阴影半径
    elevation: 2, // 为 Android 添加阴影
  },
  returnButtonText: {
    fontSize: 16, // 文字大小
    color: '#000', // 文字颜色
  },
});

export default SettingsPage;