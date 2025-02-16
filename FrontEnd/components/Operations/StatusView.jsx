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
        padding: 5, // 减小内边距
        backgroundColor: '#f5f5f5',
        borderRadius: 5, // 减小圆角大小
        zIndex: 10,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2, // 减小阴影半径
    },
    statusText: {
        fontSize: 14, // 减小字体大小
        color: '#000',
        marginBottom: 3, // 减小行间距
    },
});

export default StatusView;