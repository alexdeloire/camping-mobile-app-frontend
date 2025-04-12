import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const Loading = ({ message = "Loading...", color = "#D2691E"  }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color} />
      <Text style={[styles.loadingText, { color }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#D2691E',
  },
});

export default Loading;
