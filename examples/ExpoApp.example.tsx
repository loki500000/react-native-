/**
 * Example: Complete Expo App using generated components
 * This shows how to integrate generated components in an Expo app
 */

// App.tsx
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';

// Import generated components
import { Button } from './components/Button';
import { Card } from './components/Card';

// Import generated design tokens
import { colors, typography, spacing } from './designTokens';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Expo App</Text>
          <Text style={styles.subtitle}>Built with Figma designs</Text>
        </View>

        {/* Counter Example */}
        <View style={styles.section}>
          <Text style={styles.counterText}>Count: {count}</Text>
          {/* Generated Button with custom onPress */}
          <Button onPress={() => setCount(count + 1)} />
        </View>

        {/* Cards Section */}
        <View style={styles.section}>
          <Card />
          <Card />
        </View>
      </ScrollView>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.spacing_16,
  },
  header: {
    marginBottom: spacing.spacing_32,
    alignItems: 'center',
  },
  title: {
    fontSize: typography[0].fontSize,
    fontWeight: typography[0].fontWeight as any,
    color: colors.text_primary,
    marginBottom: spacing.spacing_8,
  },
  subtitle: {
    fontSize: typography[2].fontSize,
    color: colors.text_secondary,
  },
  section: {
    marginBottom: spacing.spacing_24,
    gap: spacing.spacing_12,
  },
  counterText: {
    fontSize: typography[1].fontSize,
    fontWeight: typography[1].fontWeight as any,
    color: colors.text_primary,
    textAlign: 'center',
    marginBottom: spacing.spacing_8,
  },
});
