/**
 * Example: Generated Button Component
 * This is an example of code generated from a Figma button design
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Button: React.FC = () => {
  return (
    <View style={styles.style0}>
      <Text style={styles.style1}>Click Me</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  style0: {
    width: 200,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  style1: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
