import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
} from 'react-native';

const ControlsScreen = () => {
  const [selectedJoystick, setSelectedJoystick] = useState('physical'); // 默认选择物理摇杆
  const [showModal, setShowModal] = useState(false); // 控制弹窗显示

  const handleJoystickChange = joystickType => {
    if (joystickType !== selectedJoystick) {
      setShowModal(true); // 显示确认弹窗
    }
  };

  const confirmChange = () => {
    setSelectedJoystick(
      selectedJoystick === 'physical' ? 'virtual' : 'physical',
    );
    setShowModal(false); // 关闭弹窗
  };

  const cancelChange = () => {
    setShowModal(false); // 关闭弹窗
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>操作摇杆设置</Text>

      <View style={styles.optionsContainer}>
        <View style={styles.option}>
          <Image
            source={require('../public/Images/py3.png')} // 替换为物理摇杆图片路径
            style={styles.optionImage}
          />
          <TouchableOpacity
            style={[
              styles.optionTextContainer,
              selectedJoystick === 'physical' && styles.selectedOption,
            ]}
            onPress={() => handleJoystickChange('physical')}>
            <Text
              style={[
                styles.optionText,
                selectedJoystick === 'physical' && styles.selectedText,
              ]}>
              物理摇杆
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.option}>
          <Image
            source={require('../public/Images/vir1.png')} // 替换为虚拟摇杆图片路径
            style={styles.optionImage}
          />
          <TouchableOpacity
            style={[
              styles.optionTextContainer,
              selectedJoystick === 'virtual' && styles.selectedOption,
            ]}
            onPress={() => handleJoystickChange('virtual')}>
            <Text
              style={[
                styles.optionText,
                selectedJoystick === 'virtual' && styles.selectedText,
              ]}>
              虚拟摇杆
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>确定要切换摇杆类型吗？</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={confirmChange}>
                <Text style={styles.modalButtonText}>确定</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={cancelChange}>
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
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
    paddingTop: 30,
    paddingHorizontal: 20,
    backgroundColor: '#0d2271',
  },
  title: {
    fontSize: 24,
    color: 'white',
    textAlign: 'left',
    marginBottom: 30,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // 居中
    width: '100%',
  },
  option: {
    alignItems: 'center',
    width: '45%',
  },
  optionImage: {
    width: 200,
    height: 190,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  optionTextContainer: {
    marginTop: 15,
    paddingHorizontal: 40,
    paddingVertical: 4,
    backgroundColor: '#0a1a4a', // 未选中时的背景色
  },
  selectedOption: {
    backgroundColor: '#3775db', // 选中时的背景色
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(95, 177, 255, 0.48)', // 选中时的边框颜色
    shadowColor: 'rgba(23, 72, 206, 0.21)', // 选中时的阴影颜色
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 2,
    shadowOpacity: 1,
  },
  optionText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#4a7a9d', // 未选中时的字体颜色
    textAlign: 'center',
    fontFamily: 'FZZZHONGJW--GB1-0', // 未选中时的字体
  },
  selectedText: {
    fontSize: 20,
    color: 'white', // 选中时的字体颜色
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#0d2271',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 20,
    color: 'white',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 18,
    color: 'white',
  },
});
export default ControlsScreen;
