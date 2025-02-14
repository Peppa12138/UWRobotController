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
            <View style={styles.row}>
                <TouchableOpacity
                    style={styles.skillButton}
                    onPress={() => handleSkillButtonPress('抓取')}>
                    <Text style={styles.buttonText}>抓取</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.skillButton}
                    onPress={() => handleSkillButtonPress('放下')}>
                    <Text style={styles.buttonText}>放下</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    skillKeysContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    skillButton: {
        width: 80,
        height: 80,
        backgroundColor: '#008CBA',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginHorizontal: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FunctionKeys;
