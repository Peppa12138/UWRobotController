// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Button } from 'react-native';

// const LoginScreen = ({ navigation }) => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');

//   // 默认的账号和密码
//   const defaultUsername = 'admin123';
//   const defaultPassword = 'abc123456';

//   // 登录逻辑
//   const handleLogin = () => {
//     if (username === '' || password === '') {
//       Alert.alert('登录失败', '账号或密码不能为空');
//     }
//     else if (username === defaultUsername && password === defaultPassword) {
//       // 登录成功，跳转到操作页面
//       navigation.navigate('OperationScreen');
//     } else {
//       // 登录失败，弹出提示
//       Alert.alert('登录失败', '账号或密码错误');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TextInput
//         style={styles.input}
//         placeholder="请输入账号"
//         value={username}
//         onChangeText={setUsername}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="请输入密码"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />
//       <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
//         <Text style={styles.loginButtonText}>登录</Text>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => navigation.navigate('Register')}>
//         <Text style={styles.registerText}>无账号？去注册</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center', // 居中所有内容
//     paddingHorizontal: 20,
//   },
//   input: {
//     height: 50,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 20,
//     paddingLeft: 10,
//     width: '100%', // 使输入框宽度适应
//   },
//   loginButton: {
//     backgroundColor: 'blue',
//     paddingVertical: 10,
//     paddingHorizontal: 50,
//     marginBottom: 20,
//     borderRadius: 5,
//     alignItems: 'center',
//     width: '20%', // 设置按钮宽度，确保居中
//   },
//   loginButtonText: {
//     color: 'white',
//     fontSize: 16,
//   },
//   registerText: {
//     color: 'lightblue',
//     fontFamily: '楷体',
//     textAlign: 'center',
//   },
// });

// export default LoginScreen;


import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios'; // 导入 axios

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 登录逻辑
  const handleLogin = () => {
    if (username === '' || password === '') {
      Alert.alert('登录失败', '账号或密码不能为空');
      return;
    }

    // 使用 axios 向后端发送登录请求
    axios
      .post('http://10.0.2.2:5000/api/auth/login', {
        username: username,
        password: password,
      })
      .then((response) => {
        // 如果登录成功
        if (response.data.message === '登录成功') {
          Alert.alert('登录成功', '欢迎回来！');
          navigation.navigate('OperationScreen');
        }
      })
      .catch((error) => {
        // 如果发生错误（例如用户名或密码错误）
        if (error.response) {
          // 错误响应：如用户名或密码错误
          Alert.alert('登录失败', error.response.data.error);
        } else if (error.request) {
          // 请求已发出，但没有收到响应
          Alert.alert('登录失败', '网络错误，请稍后重试');
        } else {
          // 其他错误
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
