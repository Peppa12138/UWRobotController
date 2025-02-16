import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios'; // 导入 axios

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 前端验证账号格式
  const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9_]{5,12}$/; // 只允许英文、数字和下划线，长度为5~12
    return regex.test(username);
  };

  // 登录逻辑
  const handleLogin = () => {
    // 验证输入账号和密码的合法性
    if (!validateUsername(username)) {
      Alert.alert('登录失败', '账号必须由英文、数字或下划线构成，且长度为5~12位');
      return;
    }

    if (password === '') {
      Alert.alert('登录失败', '密码不能为空');
      return;
    }

    // 如果合法，发送登录请求
    axios
      .post('http://10.0.2.2:5000/api/auth/login', { username, password })
      .then((response) => {
        if (response.data.message) {
          Alert.alert('登录成功', response.data.message);
          navigation.navigate('OperationScreen');
        }
      })
      .catch((error) => {
        if (error.response) {
          Alert.alert('登录失败', error.response.data.error);
        } else if (error.request) {
          Alert.alert('登录失败', '网络错误，请稍后重试');
        } else {
          Alert.alert('登录失败', '发生了未知错误');
        }
      });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="请输入账号"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="请输入密码"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
        <Text style={styles.loginButtonText}>登录</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>无账号？去注册</Text>
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
  loginButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginBottom: 20,
    borderRadius: 5,
    alignItems: 'center',
    width: '18%', // 设置按钮宽度，确保居中
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
  },
  registerText: {
    color: 'lightblue',
    fontFamily: '楷体',
    textAlign: 'center',
  },
});

export default LoginScreen;
