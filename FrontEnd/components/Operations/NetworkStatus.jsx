import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const NetworkStatus = () => {
  const [networkType, setNetworkType] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // 监听网络状态变化
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkType(state.type);
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe(); // 清理监听器
  }, []);

  return (
    <View style={styles.networkStatus}>
      <Text style={styles.statusText}>
        {isConnected ? `Connected to ${networkType}` : 'No network connection'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  networkStatus: {
    position: 'absolute',
    top: 50,   // 距离顶部20px
    right: 20, // 距离右侧20px
    zIndex: 20, // 确保它在其他元素之上
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // 设置背景颜色让它更清晰
    padding: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 16,
    color: 'white',
  },
});

export default NetworkStatus;
