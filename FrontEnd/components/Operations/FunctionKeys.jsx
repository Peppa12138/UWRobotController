import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const FunctionKeys = () => {
    // 可以扩展为执行具体命令的函数
    const handleSkillButtonPress = (command) => {
        console.log(`Executing ${command}`);
        // 这里可以通过API调用或状态更新来执行相应的任务
    };

    return (
        <View style={styles.skillKeysContainer}>
            <TouchableOpacity
                style={[styles.skillButton, styles.skillButtonLeft]}
                onPress={() => handleSkillButtonPress('抓取')}>
                <Text style={styles.buttonText}>抓取</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.skillButton, styles.skillButtonRight]}
                onPress={() => handleSkillButtonPress('放下')}>
                <Text style={styles.buttonText}>放下</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    skillKeysContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        flexDirection: 'row',
    },
    skillButton: {
        width: 60,
        height: 60,
        backgroundColor: '#008CBA',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30, // 圆形按钮
        marginHorizontal: 10,
    },
    skillButtonLeft: {
        position: 'absolute',
        bottom: 20,
        right: 80, // 调整位置
    },
    skillButtonRight: {
        position: 'absolute',
        bottom: 100,
        right: 0, // 调整位置
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FunctionKeys;