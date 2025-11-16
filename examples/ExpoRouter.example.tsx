/**
 * Example: Using generated components with Expo Router
 * This shows the new Expo Router file-based navigation
 */

// app/index.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '../components/Button';
import { colors, spacing } from '../designTokens';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>

      {/* Generated Button */}
      <Button />

      {/* Navigate to another screen */}
      <Link href="/profile" asChild>
        <Button />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.spacing_16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.spacing_24,
  },
});

// app/profile.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Card } from '../components/Card';
import { colors } from '../designTokens';

export default function Profile() {
  return (
    <>
      <Stack.Screen options={{ title: 'Profile' }} />
      <View style={styles.container}>
        <Card />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
