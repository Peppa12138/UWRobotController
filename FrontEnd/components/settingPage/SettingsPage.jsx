import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {List, Radio, Button} from '@ant-design/react-native';

const SettingsPage = ({navigation, route}) => {
  const initialFontSize = route.params?.fontSize || 14; // 获取初始字体大小
  const initialControlMode = route.params?.controlMode || 1; // 0: Virtual Key, 1: Physical Joystick
  const initialGamepadEnabled = route.params?.gamepadEnabled || false;
  
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [selectedValue, setSelectedValue] = useState(1); // 默认选择虚拟按键
  const [previousValue, setPreviousValue] = useState(initialControlMode); // 记录变更前的值
  const [modalVisible, setModalVisible] = useState(false); // 控制模态框的显示
  
  // 手柄相关状态
  const [gamepadEnabled, setGamepadEnabled] = useState(initialGamepadEnabled);
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [detectedGamepad, setDetectedGamepad] = useState(null);

  useEffect(() => {
    if (route.params?.fontSize) {
      setFontSize(route.params.fontSize);
    }
    if (route.params?.controlMode !== undefined) {
      setSelectedValue(route.params.controlMode);
    }
    if (route.params?.gamepadEnabled !== undefined) {
      setGamepadEnabled(route.params.gamepadEnabled);
    }
  }, [route.params?.fontSize, route.params?.controlMode, route.params?.gamepadEnabled]);

  const handleFontSizeChange = value => {
    setFontSize(value);
    navigation.setParams({fontSize: value}); // 更新字体大小并传递给操作页面
  };

  const handleGoBack = () => {
    navigation.navigate('OperationScreen', {
      fontSize,
      gamepadEnabled,
      gamepadInfo: detectedGamepad,
    }); // 返回并传递字体大小和手柄信息
  };

  const handleLogout = () => {
    navigation.navigate('PreLogin'); // 登出并跳转到 PreLogin 页面
  };

  const handleGamepadToggle = (value) => {
    setGamepadEnabled(value);
    navigation.setParams({gamepadEnabled: value});
    
    if (value) {
      Alert.alert(
        '手柄连接',
        '请按下GameSir X2s手柄上的任意按键来连接\n\n注意：请确保手柄已开机并处于配对状态',
        [
          {text: '确定', onPress: () => startGamepadDetection()}
        ]
      );
    } else {
      setDetectedGamepad(null);
      setGamepadConnected(false);
    }
  };

  const startGamepadDetection = () => {
    console.log('开始检测GameSir X2s手柄...');
    
    // 模拟手柄连接检测（实际项目中这会通过WebView与手柄API通信）
    setTimeout(() => {
      const mockGamepad = {
        id: 'GameSir-X2s (STANDARD GAMEPAD Vendor: 3537 Product: 1105)',
        index: 0,
        connected: true,
        timestamp: Date.now(),
        axes: 4, // 4个轴（左右摇杆各2个轴）
        buttons: 16 // 16个按钮
      };
      
      setDetectedGamepad(mockGamepad);
      setGamepadConnected(true);
      
      Alert.alert(
        '🎮 手柄连接成功',
        `已检测到：GameSir X2s\n\n摇杆同步功能已启用\n左摇杆将控制虚拟摇杆移动`,
        [{text: '确定', onPress: () => {}}]
      );
    }, 2000);
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

        {/* 手柄设置区域 */}
        <View style={styles.gamepadSection}>
          <Text style={styles.sectionTitle}>🎮 GameSir X2s 手柄设置</Text>
          
          <View style={styles.gamepadRow}>
            <Text style={styles.gamepadLabel}>启用手柄控制</Text>
            <Switch
              value={gamepadEnabled}
              onValueChange={handleGamepadToggle}
              trackColor={{false: '#767577', true: '#FF5722'}}
              thumbColor={gamepadEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          {gamepadEnabled && (
            <>
              <View style={styles.gamepadStatus}>
                <Text style={styles.gamepadStatusText}>
                  连接状态: {gamepadConnected ? '✅ 已连接' : '❌ 未连接'}
                </Text>
                {detectedGamepad && (
                  <>
                    <Text style={styles.gamepadModel}>
                      型号: GameSir X2s
                    </Text>
                    <Text style={styles.gamepadFeature}>
                      🕹️ 摇杆同步: 左摇杆 → 虚拟摇杆
                    </Text>
                    <Text style={styles.gamepadFeature}>
                      📱 支持轴数: {detectedGamepad.axes || 4}
                    </Text>
                    <Text style={styles.gamepadFeature}>
                      🔘 支持按键: {detectedGamepad.buttons || 16}
                    </Text>
                  </>
                )}
              </View>

              <View style={styles.instructionBox}>
                <Text style={styles.instructionTitle}>使用说明:</Text>
                <Text style={styles.instructionText}>
                  • 左摇杆向左 → 虚拟摇杆向左{'\n'}
                  • 左摇杆向右 → 虚拟摇杆向右{'\n'}
                  • 左摇杆向上 → 虚拟摇杆向上{'\n'}
                  • 左摇杆向下 → 虚拟摇杆向下
                </Text>
              </View>
            </>
          )}
        </View>
        <List renderHeader={'操作选择'}
         style={styles.listContainer} // 应用新的样式
        >
          <Radio.Group
            style={styles.radioGroup}
            value={selectedValue}
            onChange={e => handleControlModeChange(e.target.value)}>
            <Radio value={1} style={styles.radioItem}>
              虚拟摇杆
            </Radio>
            <Radio value={2} style={styles.radioItem}>
              物理摇杆
            </Radio>
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
  // 手柄设置样式
  gamepadSection: {
    width: '100%',
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#444',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  gamepadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  gamepadLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  gamepadStatus: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#555',
    borderRadius: 6,
  },
  gamepadStatusText: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  gamepadModel: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 5,
  },
  gamepadFeature: {
    fontSize: 11,
    color: '#ccc',
    marginBottom: 3,
  },
  instructionBox: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FF5722',
  },
  instructionTitle: {
    fontSize: 12,
    color: '#FF5722',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 11,
    color: '#ccc',
    lineHeight: 16,
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
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
    marginTop: 10,
    width: '100%',
    backgroundColor: '#333', // 设置背景色为透明
  },
  radioItem: {
    color: '#fff', // 设置文字颜色为白色
  },
  listContainer: {
    backgroundColor: '#333', // 设置操作选择部分的背景色
    borderRadius: 10, // 圆角
    padding: 10, // 内边距
    width: '100%', // 宽度占满父容器
  },
});

export default SettingsPage;