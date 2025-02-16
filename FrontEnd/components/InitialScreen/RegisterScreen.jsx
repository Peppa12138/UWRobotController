import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = () => {
        // 使用 axios 发送 POST 请求
        axios
            .post('http://10.0.2.2:5000/api/auth/register', {
                username: username,
                password: password,
            })
            .then((response) => {
                // 注册成功后的处理
                if (response.data.message) {
                    Alert.alert('注册成功', response.data.message);
                    navigation.navigate('Login');
                }
            })
            .catch((error) => {
                // 处理错误
                if (error.response) {
                    // 请求发出并得到了响应，但响应状态码不是 2xx
                    Alert.alert('注册失败', error.response.data.error);
                } else if (error.request) {
                    // 请求已发出，但没有收到响应
                    Alert.alert('注册失败', '网络错误，请稍后重试');
                } else {
                    // 其他错误
                    Alert.alert('注册失败', '发生了未知错误');
                }
            });
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="账号由英文、数字及下划线构成（5-12位）"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="密码至少包含英文、数字或感叹号中的两种（8-16位）"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {/* 注册按钮居中展示 */}
            <TouchableOpacity onPress={handleRegister} style={styles.registerButton}>
                <Text style={styles.registerButtonText}>注册</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>已有账号？去登录</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center', // 居中所有内容
        paddingHorizontal: 20,
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        paddingLeft: 10,
        width: '100%', // 使输入框宽度适应
    },
    registerButton: {
        backgroundColor: 'blue',
        paddingVertical: 10,
        paddingHorizontal: 50,
        marginBottom: 20,
        borderRadius: 5,
        alignItems: 'center',
        width: '18%', // 设置按钮宽度，确保居中
    },
    registerButtonText: {
        color: 'white',
        fontSize: 16,
    },
    loginText: {
        color: 'lightblue',
        fontFamily: '楷体',
        textAlign: 'center',
    },
});

export default RegisterScreen;
