import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {List, Radio, Button} from '@ant-design/react-native';
const SettingsPage = ({navigation, route}) => {
  const initialFontSize = route.params?.fontSize || 14; // 获取初始字体大小
  const initialControlMode = route.params?.controlMode || 1; // 0: Virtual Key, 1: Physical Joystick
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [selectedValue, setSelectedValue] = useState(1); // 默认选择虚拟按键
  const [previousValue, setPreviousValue] = useState(initialControlMode); // 记录变更前的值
  const [modalVisible, setModalVisible] = useState(false); // 控制模态框的显示

  useEffect(() => {
    if (route.params?.fontSize) {
      setFontSize(route.params.fontSize);
    }
    if (route.params?.controlMode !== undefined) {
      setSelectedValue(route.params.controlMode);
    }
  }, [route.params?.fontSize, route.params?.controlMode]);

  const handleFontSizeChange = value => {
    setFontSize(value);
    navigation.setParams({fontSize: value}); // 更新字体大小并传递给操作页面
  };

  const handleGoBack = () => {
    navigation.navigate('OperationScreen', {fontSize}); // 返回并传递字体大小
  };

  const handleLogout = () => {
    navigation.navigate('PreLogin'); // 登出并跳转到 PreLogin 页面
  };

  const handleControlModeChange = value => {
    // 记录用户当前选择的值作为变更前的值
    setPreviousValue(selectedValue);

    // 在用户选择新的操作模式时，首先更新 selectedValue
    setSelectedValue(value);

    // 如果选择的操作模式与当前不同，则弹出确认框
    if (selectedValue !== value) {
      setModalVisible(true);
    } else {
      navigation.setParams({controlMode: value}); // 即时更新控制模式
    }
  };

  const confirmChangeControlMode = () => {
    navigation.setParams({controlMode: selectedValue});
    setModalVisible(false); // Close the modal
  };

  const cancelChangeControlMode = () => {
    // 取消时恢复之前的值
    setSelectedValue(previousValue); // 恢复变更前的操作模式
    setModalVisible(false); // 关闭模态框不做任何更改
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.returnButton} onPress={handleGoBack}>
        <Image
          source={require('../public/Images/return.png')}
          style={styles.returnButtonImage}
        />
      </TouchableOpacity>

      <View style={styles.modalContent}>
        <Text style={styles.label}>字号：</Text>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={30}
          step={1}
          value={fontSize}
          onValueChange={handleFontSizeChange}
          thumbTintColor="#FF5722"
          minimumTrackTintColor="#FF5722"
          maximumTrackTintColor="#FFFFFF"
          trackStyle={styles.trackStyle}
          thumbStyle={styles.thumbStyle}
        />
        <List renderHeader={'操作选择'}>
          <Radio.Group
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              paddingVertical: 6,
              marginTop: 10,
              width: '100%',
            }}
            value={selectedValue}
            onChange={e => handleControlModeChange(e.target.value)}>
            <Radio value={1}>虚拟摇杆</Radio>
            <Radio value={2}>物理摇杆</Radio>
          </Radio.Group>
        </List>
      </View>

      {/* 登出按钮 */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Image
          source={require('../public/Images/logout.png')} // 替换为你的登出图片路径
          style={styles.logoutButtonImage}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelChangeControlMode}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>确定更改操作模式吗？</Text>
            <View style={styles.modalButtons}>
              <Button type="primary" onPress={confirmChangeControlMode}>
                确定
              </Button>
              <Button onPress={cancelChangeControlMode}>取消</Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // 半透明背景
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%', // 弹窗宽度为屏幕宽度的80%
    backgroundColor: '#333', // 弹窗背景色
    borderRadius: 10, // 圆角
    padding: 20,
    alignItems: 'center',
  },
  returnButton: {
    position: 'absolute', // 绝对定位
    top: 40, // 距离顶部 40
    left: 20, // 距离左侧 20
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  returnButtonImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  slider: {
    width: '100%', // 滑动条宽度占满弹窗
    height: 40,
  },
  trackStyle: {
    height: 4,
    borderRadius: 2,
  },
  thumbStyle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF5722',
  },
  logoutButton: {
    marginTop: 20, // 与上方内容的间距
    backgroundColor: '#FF5722', // 按钮背景色
    borderRadius: 20, // 圆角
    padding: 10, // 内边距
    justifyContent: 'center',
    alignItems: 'center',
    width: 40, // 按钮宽度
    height: 40, // 按钮高度
  },
  logoutButtonImage: {
    width: 20, // 图片宽度
    height: 20, // 图片高度
    resizeMode: 'contain', // 保持图片比例
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

export default SettingsPage;
