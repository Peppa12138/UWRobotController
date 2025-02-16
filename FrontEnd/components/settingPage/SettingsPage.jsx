import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const SettingsPage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.columnContainer}>
        {/* 返回键 */}
        <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
          <Image
            source={require('../public/Images/return.png')} // 使用相对路径加载图片
            style={styles.returnButtonImage}
          />
        </TouchableOpacity>
        {/* 设置项 */}
        <TouchableOpacity style={styles.settingItem} onPress={() => alert('点击了音效设置')}>
          <Text style={styles.settingText}>音效</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={() => alert('点击了画面设置')}>
          <Text style={styles.settingText}>画面</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={() => alert('点击了操作设置')}>
          <Text style={styles.settingText}>操作</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1976D2', // 深蓝色背景
    padding: 20,
  },
  columnContainer: {
    flexDirection: 'column', // 列排列
    alignItems: 'flex-start', // 对齐到左侧
    marginBottom: 20, // 与标题的间距
  },
  settingItem: {
    width: 90, // 宽度
    height: 60, // 高度
    padding: 15,
    backgroundColor: '#1976D2', // 深蓝色卡片背景
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'center', // 垂直居中文本
    alignItems: 'center', // 水平居中文本
  },
  settingText: {
    fontSize: 18,
    color: '#fff', // 白色文字
  },
  returnButton: {
    width: 80, // 按钮宽度
    height: 60, // 按钮高度
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10, // 与设置项的间距
  },
  returnButtonImage: {
    width: 40, // 图片宽度
    height: 40, // 图片高度
    resizeMode: 'contain', // 保持图片比例
  },
});

export default SettingsPage;