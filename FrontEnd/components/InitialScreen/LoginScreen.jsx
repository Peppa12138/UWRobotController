import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import axios from 'axios'; // 导入 axios
import Toast from 'react-native-toast-message'; // 导入 Toast 组件
import Orientation from 'react-native-orientation-locker'; //竖屏切换组件

const LoginScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 控制密码明文或加密显示
  Orientation.lockToPortrait(); //锁住竖屏
  // 前端验证账号格式
  const validateUsername = username => {
    const regex = /^[a-zA-Z0-9_]{5,12}$/; // 只允许英文、数字和下划线，长度为5~12
    return regex.test(username);
  };

  const handleLogin = () => {
    // 验证输入账号和密码的合法性
    if (!validateUsername(username)) {
      Alert.alert(
        '登录失败',
        '账号必须由英文、数字或下划线构成，且长度为5~12位',
      );
      console.log('1');

      Toast.show({
        type: 'error',
        text1: '登录失败',
        text2: '账号必须由英文、数字或下划线构成，且长度为5~12位',
      });
      return;
    }

    if (password === '') {
      console.log('2');
      Toast.show({
        type: 'error',
        text1: '登录失败',
        text2: '密码不能为空',
      });
      return;
    }

    // 如果合法，发送登录请求
    axios
      .post('http://10.0.2.2:5000/api/auth/login', {username, password})
      .then(response => {
        if (response.data.message) {
          console.log('3');

          // 先显示 Toast
          Toast.show({
            type: 'success',
            text1: '登录成功',
            text2: response.data.message,
          });
          // 跳转到操作界面并设置延迟消失
          setTimeout(() => {
            navigation.navigate('AfterLogin');
          }, 2000); // 延迟2秒后跳转
        }
      })
      .catch(error => {
        if (error.response) {
          console.log('4');
          Toast.show({
            type: 'error',
            text1: '登录失败',
            text2: error.response.data.error,
          });
        } else if (error.request) {
          console.log('5');
          Toast.show({
            type: 'error',
            text1: '登录失败',
            text2: '网络错误，请稍后重试',
          });
        } else {
          console.log('6');
          Toast.show({
            type: 'error',
            text1: '登录失败',
            text2: '发生了未知错误',
          });
        }
      });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.returnButton}
        onPress={() => navigation.navigate('PreLogin')}>
        <Image
          source={require('../public/Images/return.png')} // 使用相对路径加载图片
          style={styles.returnButtonImage}
        />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="请输入账号"
          value={username}
          onChangeText={setUsername}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="请输入密码"
            secureTextEntry={!showPassword} // Toggle password visibility
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowPassword(!showPassword)}>
            <Text>{showPassword ? '隐藏' : '显示'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
          <Text style={styles.loginButtonText}>登录</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>无账号？去注册</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // 居中所有内容
    paddingHorizontal: 20,
    position: 'relative', // 使返回按钮可以绝对定位
  },
  returnButton: {
    position: 'absolute',
    top: 20, // 距离顶部
    left: 20, // 距离左边
    padding: 10, // 按钮的内边距
  },
  returnButtonImage: {
    width: 25, // 按钮的宽度
    height: 25, // 按钮的高度
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1, // 居中主要内容
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    width: 350, // 调整宽度，适应界面
  },
  passwordContainer: {
    position: 'relative',
    width: 350, // 保持与输入框一致的宽度
  },
  showPasswordButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,
  },
  loginButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginBottom: 20,
    borderRadius: 5,
    alignItems: 'center',
    width: '50%', // 设置按钮宽度，确保居中
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
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: 'Garamond',
  },
});

export default LoginScreen;
