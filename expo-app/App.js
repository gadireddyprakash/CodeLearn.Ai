import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Platform, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';

// Active live URL connected to your backend & MongoDB
const APP_URL = 'https://2758c0eb888aee.lhr.life';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <WebView 
        source={{ uri: APP_URL }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mixedContentMode="always"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
