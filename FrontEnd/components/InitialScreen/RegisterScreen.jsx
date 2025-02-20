import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message'; // 导入 Toast 组件
import Orientation from 'react-native-orientation-locker'; //竖屏切换组件

const RegisterScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  Orientation.lockToPortrait(); //锁住竖屏
  // 前端验证用户名和密码
  const validateUsername = username => {
    const regex = /^[a-zA-Z0-9_]{5,12}$/; // 只允许英文、数字和下划线，长度为5~12
    return regex.test(username);
  };

  const validatePassword = password => {
    const hasLetter = /[a-zA-Z]/.test(password); // 是否包含字母
    const hasDigit = /\d/.test(password); // 是否包含数字
    const hasExclamation = /!/.test(password); // 是否包含感叹号
    const isValidLength = password.length >= 8 && password.length <= 16; // 长度8~16
    const isValidType = hasLetter + hasDigit + hasExclamation >= 2; // 至少包含两种类型
    return isValidLength && isValidType;
  };

  // 注册逻辑
  const handleRegister = () => {
    // 验证账号和密码的合法性
    if (!validateUsername(username)) {
      Toast.show({
        type: 'error',
        text1: '注册失败',
        text2: '账号必须由英文、数字或下划线构成，且长度为5~12位',
      });
      return;
    }

    if (!validatePassword(password)) {
      Toast.show({
        type: 'error',
        text1: '注册失败',
        text2: '密码必须包含英文、数字或感叹号中的两种，且长度为8~16位',
      });
      return;
    }

    // 如果合法，发送注册请求
    axios
      .post('http://10.0.2.2:5000/api/auth/register', {
        username: username,
        password: password,
      })
      .then(response => {
        // 注册成功后跳转到登录页面
        if (response.data.message) {
          Toast.show({
            type: 'success',
            text1: '注册成功',
            text2: response.data.message,
          });
          navigation.navigate('Login');
        }
      })
      .catch(error => {
        // 错误处理
        if (error.response) {
          Toast.show({
            type: 'error',
            text1: '注册失败',
            text2: error.response.data.error,
          });
        } else if (error.request) {
          Toast.show({
            type: 'error',
            text1: '注册失败',
            text2: '网络错误，请稍后重试',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: '注册失败',
            text2: '发生了未知错误',
          });
        }
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
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
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: 'Garamond', // 可根据需要修改字体
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    width: '60%', // 输入框宽度适应
  },
  registerButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginBottom: 20,
    borderRadius: 5,
    alignItems: 'center',
    width: '30%', // 设置按钮宽度，确保居中
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
