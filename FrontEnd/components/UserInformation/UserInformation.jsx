import React, {useEffect, useState} from 'react';
import {View, Text, Button, Modal, TextInput, Alert, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';

const UserInformation = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [authorizationCode, setAuthorizationCode] = useState('');
  const [username, setUsername] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');
  const navigation = useNavigation();

  const defaultAuthorizationCode = '12138';

  useEffect(() => {
    // 使用axios获取用户信息
    axios
      .get('http://10.0.2.2:5000/api/auth/getUserInfo')
      .then(response => {
        const {username, created_at} = response.data;
        setUsername(username);
        setRegistrationDate(created_at);
      })
      .catch(error => console.error('获取用户信息失败', error));
  }, []);

  const handlePasswordChange = () => {
    if (authorizationCode === defaultAuthorizationCode) {
      // 跳转到密码修改界面
          navigation.navigate('ChangePassword');
        console.log('密码修改界面');
    } else {
      Alert.alert('错误', '授权码错误，请重新输入');
    }
  };

    const handleCloseModal = () => {
        setModalVisible(false);
        setAuthorizationCode('');
    };
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <TouchableOpacity
        style={styles.returnButton}
        onPress={() => navigation.navigate('AfterLogin')}>
        <Image
          source={require('../public/Images/return.png')} // 使用相对路径加载图片
          style={styles.returnButtonImage}
        />
      </TouchableOpacity>
      <Text>用户名：{username}</Text>
      <Text>注册时间：{registrationDate}</Text>
      <Button title="修改密码" onPress={() => setModalVisible(true)} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <View
            style={{
              width: 300,
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 10,
            }}>
            <Text>请输入授权码：</Text>
            <TextInput
              style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1,
                marginBottom: 20,
                paddingLeft: 10,
              }}
              secureTextEntry
              value={authorizationCode}
              onChangeText={setAuthorizationCode}
            />
            <Button title="提交" onPress={handlePasswordChange} />
            <Button title="离开" onPress={handleCloseModal} />
          </View>
        </View>
      </Modal>
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
});


export default UserInformation;
