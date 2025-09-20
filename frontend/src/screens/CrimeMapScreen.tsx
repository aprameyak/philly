import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

export default function CrimeMapScreen() {
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Crime map interaction:', data);
      if (data.type === 'filter_changed') {
        Alert.alert(
          'Filter Updated',
          `Showing ${data.data_count} ${data.filter} crime incidents`
        );
      }
    } catch (error) {
      console.error('Error parsing message from WebView:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={require('../assets/deckgl-crime-map.html')}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
