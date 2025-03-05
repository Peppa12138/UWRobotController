import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions, Image} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const {width, height} = Dimensions.get('window');

const NetworkStatus = () => {
  const [networkType, setNetworkType] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // 监听网络状态变化
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkType(state.type);
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // 根据网络状态返回对应的图片资源
  const getNetworkImage = () => {
    if (!isConnected) {
      return require('../public/Images/no_signal.png');
    }
    if (networkType.toLowerCase() === 'wifi') {
      return require('../public/Images/wifi.png');
    }
    if (networkType.toLowerCase() === 'cellular') {
      return require('../public/Images/mobile.png');
    }
    // 如果其他类型，默认也显示无信号图片
    return require('../public/Images/no_signal.png');
  };

  return (
    <View style={styles.networkStatus}>
      <Text style={styles.statusText}>
        {isConnected ? `Connected to :` : 'No network connection'}
      </Text>
      <Image source={getNetworkImage()} style={styles.networkImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  networkStatus: {
    position: 'absolute',
    top: height * 0.15,
    right: width * 0.02,
    zIndex: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkImage: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: 'white',
  },
});

export default NetworkStatus;
