// StatusView.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatusView = () => {
    return (
        <View style={styles.statusContainer}>
            <Text style={styles.statusText}>压强: 1000Pa</Text>
            <Text style={styles.statusText}>温度: 6°C</Text>
            <Text style={styles.statusText}>高度: 10m</Text>
            <Text style={styles.statusText}>速度: 1m/s</Text>
            <Text style={styles.statusText}>抓取状态: 正常</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    statusContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.5)', // 半透明背景
        borderRadius: 10,
        zIndex: 10,
    },
    statusText: {
        fontSize: 18,
        color: '#000',
        marginBottom: 5,
    },
});

export default StatusView;
