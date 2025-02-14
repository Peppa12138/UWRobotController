// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import React from 'react';
// import { PropsWithChildren } from 'react';
// import {
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   useColorScheme,
//   View,
// } from 'react-native';

// import {
//   Colors,
//   DebugInstructions,
//   Header,
//   LearnMoreLinks,
//   ReloadInstructions,
// } from 'react-native/Libraries/NewAppScreen';

// function App() {
//   return (
//     <View>
//       <Text>Android 就是个SB</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//   },
//   highlight: {
//     fontWeight: '700',
//   },
// });

// export default App;




import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import DirectionPad from './components/DirectionPad'; // 引入 DirectionPad 组件

function App() {
  const handleDirectionPress = (direction) => {
    console.log(`Pressed ${direction} button`);
    // 你可以在这里添加处理方向键按下的逻辑
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <DirectionPad onPress={handleDirectionPress} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  content: {
    alignItems: 'center',
  },
});

export default App;