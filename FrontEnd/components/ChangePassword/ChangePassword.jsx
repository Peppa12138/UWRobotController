import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';

const ChangePassword = ({navigation}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 控制密码明文或加密显示

  const handleChangePassword = () => {
    if (newPassword === confirmPassword) {
      Alert.alert('成功', '密码修改成功，请重新登录！');
      navigation.navigate('PreLogin');
      // 这里可以添加保存密码的逻辑
    } else {
      Alert.alert('错误', '两次密码不一致');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.returnButton}
        onPress={() => navigation.navigate('AfterLogin')}>
        <Image
          source={require('../public/Images/return.png')} // 使用相对路径加载图片
          style={styles.returnButtonImage}
        />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>Change your password</Text>
        <TextInput
          style={styles.input}
          placeholder="请输入新密码"
          secureTextEntry={!showPassword} // Toggle password visibility
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="请重新确认密码"
            secureTextEntry={!showPassword} // Toggle password visibility
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowPassword(!showPassword)}>
            <Text>{showPassword ? '隐藏' : '显示'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleChangePassword} style={styles.Button}>
          <Text style={styles.ButtonText}>修改</Text>
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
  Button: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginBottom: 20,
    borderRadius: 5,
    alignItems: 'center',
    width: '50%', // 设置按钮宽度，确保居中
  },
  ButtonText: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: 'Garamond',
  },
});

export default ChangePassword;
