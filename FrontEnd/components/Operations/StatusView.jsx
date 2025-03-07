import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const StatusView = ({ fontSize, statusData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={
              isExpanded
                ? require('../public/Images/collapse.png')
                : require('../public/Images/expand.png')
            }
            style={styles.icon}
          />
          <Text style={[styles.headerText, { fontSize }]}>
            {isExpanded ? '收起' : '展开'}
          </Text>
        </View>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { fontSize }]}>
            压强: {statusData.pressure || '加载中...'}
          </Text>
          <Text style={[styles.statusText, { fontSize }]}>
            温度: {statusData.temperature || '加载中...'}
          </Text>
          <Text style={[styles.statusText, { fontSize }]}>
            高度: {statusData.altitude || '加载中...'}
          </Text>
          <Text style={[styles.statusText, { fontSize }]}>
            速度: {statusData.speed || '加载中...'}
          </Text>
          <Text style={[styles.statusText, { fontSize }]}>
            抓取状态: {statusData.status || '加载中...'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 10,
    margin: 10,
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    // 阴影效果
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  headerText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 20, // 增加图片与文字之间的间距
  },
  statusContainer: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  statusText: {
    color: '#fff',
    marginBottom: 5,
  },
});

export default StatusView;
