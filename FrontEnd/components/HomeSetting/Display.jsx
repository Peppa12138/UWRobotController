import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import fontSizeManager from '../../utils/FontSizeManager';
import displaySettingsManager from '../../utils/DisplaySettingsManager';

const {width, height} = Dimensions.get('window');

// 屏幕组件
const DisplayScreen = () => {
  const [fontSize, setFontSize] = useState(16);
  
  // 数据显示控制状态
  const [displaySettings, setDisplaySettings] = useState(
    displaySettingsManager.getCurrentSettings()
  );

  // 从字体管理器加载字体大小
  useEffect(() => {
    loadFontSize();
    loadDisplaySettings();
    
    // 监听字体大小变化
    const removeFontListener = fontSizeManager.addListener((newSize) => {
      setFontSize(newSize);
    });

    // 监听显示设置变化
    const removeDisplayListener = displaySettingsManager.addListener((newSettings) => {
      setDisplaySettings(newSettings);
    });

    return () => {
      removeFontListener(); // 清理监听器
      removeDisplayListener();
    };
  }, []);

  const loadFontSize = async () => {
    const size = await fontSizeManager.loadFontSize();
    setFontSize(size);
  };

  const saveFontSize = async (newSize) => {
    await fontSizeManager.setFontSize(newSize);
  };

  // 加载数据显示设置
  const loadDisplaySettings = async () => {
    const settings = await displaySettingsManager.loadDisplaySettings();
    setDisplaySettings(settings);
  };

  // 切换单个显示项
  const toggleDisplayItem = (key) => {
    displaySettingsManager.toggleComponent(key);
  };

  const presetSizes = [
    {label: '小', value: 12},
    {label: '中', value: 16},
    {label: '大', value: 20},
    {label: '特大', value: 24},
  ];

  const displayItems = [
    { key: 'networkStatus', label: '网络状态', description: '显示网络连接状态' },
    { key: 'videoStats', label: '视频统计', description: '显示帧率和播放信息' },
    { key: 'statusView', label: '设备状态', description: '显示机器人状态数据' },
    { key: 'virtualJoystick', label: '虚拟摇杆', description: '显示触摸控制摇杆' },
  ];

  return (
    <View style={styles.contentContainer}>
      <Text style={styles.titleText}>
        画面设置
      </Text>
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 字体大小调节区域 - 紧凑版本 */}
        <View style={styles.fontSizeContainer}>
          <Text style={styles.sectionTitle}>
            字体大小调节
          </Text>
          
          {/* 预设大小按钮 - 一行显示 */}
          <View style={styles.presetButtonsContainer}>
            {presetSizes.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.presetButton,
                  fontSize === preset.value && styles.presetButtonActive
                ]}
                onPress={() => saveFontSize(preset.value)}
              >
                <Text
                  style={[
                    styles.presetButtonText,
                    fontSize === preset.value && styles.presetButtonTextActive
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 精细调节滑块 */}
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              精细调节: {fontSize}px
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={10}
              maximumValue={32}
              value={fontSize}
              onValueChange={saveFontSize}
              step={1}
              minimumTrackTintColor="#4A90E2"
              maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
              thumbStyle={styles.sliderThumb}
            />
          </View>
        </View>

        {/* 数据显示控制模块 */}
        <View style={styles.dataDisplayContainer}>
          <Text style={styles.sectionTitle}>
            数据显示控制
          </Text>
          <Text style={styles.sectionSubtitle}>
            选择操作界面上要显示的数据项
          </Text>
          
          {displayItems.map((item, index) => (
            <View key={item.key} style={styles.displayItem}>
              <View style={styles.displayItemInfo}>
                <Text style={styles.displayItemLabel}>
                  {item.label}
                </Text>
                <Text style={styles.displayItemDescription}>
                  {item.description}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleSwitch,
                  displaySettings[item.key] && styles.toggleSwitchActive
                ]}
                onPress={() => toggleDisplayItem(item.key)}
              >
                <View
                  style={[
                    styles.toggleIndicator,
                    displaySettings[item.key] && styles.toggleIndicatorActive
                  ]}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* 其他画面设置选项可以在这里添加 */}
        <View style={styles.otherSettingsContainer}>
          <Text style={styles.otherSettingsText}>
            更多画面设置功能敬请期待...
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: '#0d2271',
    borderRightWidth: 1, // 右侧边框宽度
    borderRightColor: 'rgba(13, 34, 113, 1)', // 右侧边框颜色，可以自由修改
  },
  exitButton: {
    position: 'absolute',
    top: 20,
    left: width / 21,
    zIndex: 1,
  },
  exitText: {
    fontSize: 32,
    color: 'white',
  },
  navItems: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navItem: {
    marginVertical: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navBackgroundImage: {
    position: 'absolute', // 绝对定位
    right: -width / 42,
    height: 60,
    width: width / 6.5,
  },
  navText: {
    color: 'white',
    fontSize: 28,
    zIndex: 1, // 确保文字在最上层
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#0d2271',
  },
  titleText: {
    color: 'white',
    fontSize: 24, // 从28px缩小到24px
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20, // 缩小边距为滚动留空间
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 30, // 底部留空间
  },
  fontSizeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12, // 从15缩小到12
    padding: 15, // 从20缩小到15
    marginBottom: 20, // 为下一个模块留间距
    // 固定高度，不随内容扩展
    maxHeight: 160, // 从220缩小到160
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18, // 从20缩小到18
    fontWeight: 'bold',
    marginBottom: 12, // 从15缩小到12
    textAlign: 'center',
  },
  presetButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12, // 从15缩小到12
    paddingHorizontal: 8, // 从10缩小到8
  },
  presetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12, // 从15缩小到12
    paddingHorizontal: 10, // 从12缩小到10
    paddingVertical: 6, // 从8缩小到6
    marginHorizontal: 2, // 从3缩小到2
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 40, // 从45缩小到40
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
    borderColor: '#4A90E2',
  },
  presetButtonText: {
    color: 'white',
    fontSize: 14, // 从16缩小到14
    fontWeight: '600',
  },
  presetButtonTextActive: {
    color: '#4A90E2',
  },
  sliderContainer: {
    marginBottom: 0, // 移除底部边距，因为没有预览区域了
    paddingHorizontal: 8, // 从10缩小到8
  },
  sliderLabel: {
    color: 'white',
    fontSize: 14, // 从16缩小到14
    textAlign: 'center',
    marginBottom: 8, // 从10缩小到8
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 30, // 减小高度
  },
  sliderThumb: {
    backgroundColor: '#4A90E2',
    width: 20, // 减小尺寸
    height: 20,
    borderRadius: 10,
  },
  dataDisplayContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  sectionSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  displayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  displayItemInfo: {
    flex: 1,
    marginRight: 15,
  },
  displayItemLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  displayItemDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    lineHeight: 16,
  },
  toggleSwitch: {
    width: 50,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 2,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  toggleSwitchActive: {
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
    borderColor: '#4A90E2',
  },
  toggleIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 2,
    transition: 'margin-left 0.2s ease',
  },
  toggleIndicatorActive: {
    backgroundColor: '#4A90E2',
    marginLeft: 26,
  },
  otherSettingsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10, // 底部留少量空间
    justifyContent: 'center',
    alignItems: 'center',
  },
  otherSettingsText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 18, // 固定字体大小
    fontStyle: 'italic',
  },
  drawerStyle: {
    backgroundColor: '#0d2271',
    width: width / 6.5,
  },
  returnButtonImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  bottomImage: {
    position: 'absolute', // 绝对定位
    left: width / 5.5,
    bottom: -height / 6.5, // 距离底部 20
    width: '74%', // 覆盖整个宽度
    height: 200, // 设置图片高度
    zIndex: 999, // 确保图片在最上层
    resizeMode: 'contain', // 保持图片比例
    opacity: 0.34, // 设置不透明度为
  },
  bottomImage2: {
    position: 'absolute', // 绝对定位
    left: -width / 3.5,
    bottom: -height / 5.6, // 距离底部 20
    width: width * 1.5, // 覆盖整个宽度
    height: height / 1.8, // 设置图片高度
    zIndex: 0, // 确保图片在最上层
    resizeMode: 'contain', // 保持图片比例
    opacity: 0.25, // 设置不透明度为
    pointerEvents: 'none', // 不拦截点击事件
  },
});

export default DisplayScreen;
