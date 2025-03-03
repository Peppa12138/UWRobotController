// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// const StatusView = ({ fontSize }) => {
//   return (
//     <View style={styles.statusContainer}>
//       <Text style={[styles.statusText, { fontSize }]}>压强: 1000Pa</Text>
//       <Text style={[styles.statusText, { fontSize }]}>温度: 6°C</Text>
//       <Text style={[styles.statusText, { fontSize }]}>高度: 10m</Text>
//       <Text style={[styles.statusText, { fontSize }]}>速度: 1m/s</Text>
//       <Text style={[styles.statusText, { fontSize }]}>抓取状态: 正常</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   statusContainer: {
//     padding: 5,
//     borderRadius: 5,
//     zIndex: 10,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   statusText: {
//     color: '#fff', // 字体颜色改为白色
//     marginBottom: 3,
//   },
// });

// export default StatusView;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatusView = ({ fontSize, statusData }) => {
  return (
    <View style={styles.statusContainer}>
      <Text style={[styles.statusText, { fontSize }]}>压强: {statusData.pressure || '加载中...'}</Text>
      <Text style={[styles.statusText, { fontSize }]}>温度: {statusData.temperature || '加载中...'}</Text>
      <Text style={[styles.statusText, { fontSize }]}>高度: {statusData.altitude || '加载中...'}</Text>
      <Text style={[styles.statusText, { fontSize }]}>速度: {statusData.speed || '加载中...'}</Text>
      <Text style={[styles.statusText, { fontSize }]}>抓取状态: {statusData.status || '加载中...'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    padding: 5,
    borderRadius: 5,
    zIndex: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusText: {
    color: '#fff',
    marginBottom: 3,
  },
});

export default StatusView;
