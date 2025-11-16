# Expo Compatibility

✅ **All generated code is 100% Expo compatible!**

## What Makes It Compatible

The generator produces pure React Native code using only standard components and APIs that work perfectly with Expo:

### Standard Components Used
- ✅ `View` - Core layout component
- ✅ `Text` - Text display
- ✅ `StyleSheet` - Styling API
- ✅ `TouchableOpacity` / `Pressable` - Touch interactions
- ✅ `Image` - Image display
- ✅ `TextInput` - Text input fields
- ✅ `ScrollView` - Scrollable containers
- ✅ `FlatList` - Optimized lists

### No Native Modules Required
- ❌ No platform-specific native code
- ❌ No linking required
- ❌ No need to eject from Expo
- ✅ Pure JavaScript/TypeScript

## Using with Expo Projects

### 1. Create Expo App

```bash
npx create-expo-app my-app
cd my-app
```

### 2. Install Dependencies (if using styled-components)

```bash
# Only needed if you generate with --style styled-components
npm install styled-components
npm install --save-dev @types/styled-components @types/styled-components-react-native
```

### 3. Generate Components

```bash
# Set your Figma token
export FIGMA_TOKEN="your-token"

# Generate components for your Expo app
figma-rn generate <file-id> --output ./components
```

### 4. Use Generated Components

```tsx
// App.tsx
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Button } from './components/Button'; // Your generated component

export default function App() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button />
      <StatusBar style="auto" />
    </View>
  );
}
```

## Styling Options with Expo

### StyleSheet (Default - Recommended for Expo)

```bash
figma-rn generate <file-id> --style stylesheet
```

**Pros:**
- ✅ Zero additional dependencies
- ✅ Best performance
- ✅ Smallest bundle size
- ✅ Native to React Native/Expo

**Example Output:**
```tsx
import { View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
```

### styled-components

```bash
figma-rn generate <file-id> --style styled-components
```

**Requires:**
```bash
npm install styled-components
```

**Pros:**
- ✅ CSS-in-JS syntax
- ✅ Dynamic styling
- ✅ Theming support

**Example Output:**
```tsx
import styled from 'styled-components/native';

const Container = styled.View`
  flex: 1;
  background-color: #fff;
`;
```

### Inline Styles

```bash
figma-rn generate <file-id> --style inline
```

**Pros:**
- ✅ Zero additional dependencies
- ✅ Simple and quick
- ✅ Good for prototyping

**Example Output:**
```tsx
<View style={{ flex: 1, backgroundColor: '#fff' }}>
```

## Expo Web Compatibility

The generated code also works with **Expo Web** (React Native for Web):

```bash
expo start --web
```

**Compatible:**
- ✅ StyleSheet
- ✅ Core components (View, Text, etc.)
- ✅ Flexbox layouts
- ✅ Most styling properties

**May Need Adjustments:**
- ⚠️ Some shadow styles (use `boxShadow` for web)
- ⚠️ Platform-specific adjustments

## Asset Handling with Expo

When using `--assets` flag:

```bash
figma-rn generate <file-id> --assets --output ./components
```

Generated images work directly with Expo:

```tsx
// Generated code
import icon from './assets/icon.png';

<Image source={icon} />
```

Or use Expo's asset system:

```tsx
import { Asset } from 'expo-asset';
```

## TypeScript with Expo

Generated TypeScript code works seamlessly:

```bash
figma-rn generate <file-id> --typescript
```

Expo already has TypeScript support built-in.

## Example: Full Expo Integration

### 1. Generate Components

```bash
figma-rn generate abc123 \
  --output ./src/components \
  --style stylesheet \
  --typescript \
  --assets \
  --tokens
```

### 2. Project Structure

```
my-expo-app/
├── App.tsx
├── src/
│   ├── components/         # Generated components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── assets/         # Generated images
│   ├── designTokens.ts     # Generated tokens
│   └── screens/
│       └── HomeScreen.tsx
```

### 3. Use Design Tokens

```tsx
// src/screens/HomeScreen.tsx
import { View, Text } from 'react-native';
import { colors, typography } from '../designTokens';
import { Button } from '../components/Button';

export const HomeScreen = () => {
  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.background
    }}>
      <Text style={{
        fontSize: typography[0].fontSize,
        fontWeight: typography[0].fontWeight
      }}>
        Welcome
      </Text>
      <Button />
    </View>
  );
};
```

## Expo Go Compatibility

✅ **All generated code works in Expo Go** (the Expo mobile app for testing)

No custom native code means:
- Test directly in Expo Go
- No need for development builds
- Fast iteration

## Platform-Specific Code

If you need platform-specific adjustments:

```tsx
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
});
```

## Common Expo Patterns

### Navigation (React Navigation)

```tsx
// Generated components work with React Navigation
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button } from './components/Button';

const Stack = createNativeStackNavigator();

function HomeScreen() {
  return (
    <View>
      <Button />
    </View>
  );
}
```

### Expo Router

```tsx
// app/index.tsx
import { View } from 'react-native';
import { Button } from '../components/Button';

export default function Home() {
  return (
    <View>
      <Button />
    </View>
  );
}
```

## Recommended Workflow

1. **Design in Figma** with proper naming (Button, Icon, etc.)
2. **Generate code** with this tool
3. **Copy to Expo project** (src/components/)
4. **Add interactivity** (onPress handlers, navigation, etc.)
5. **Test in Expo Go**
6. **Deploy** with EAS Build

## Testing Generated Components

```bash
# In your Expo project
npm test
```

Or use Expo's testing tools:

```bash
npm install --save-dev @testing-library/react-native
```

## Limitations & Notes

### What Works Perfectly ✅
- All layout components
- Styling (StyleSheet, styled-components, inline)
- Images and assets
- Typography
- Colors and design tokens
- Touch interactions
- Lists and scrolling

### What May Need Manual Adjustment ⚠️
- **Animations** - Add using `react-native-reanimated` (Expo compatible)
- **Custom fonts** - Use Expo's font loading
- **Icons** - Consider `@expo/vector-icons`
- **Complex interactions** - Add state management
- **Navigation** - Integrate with React Navigation or Expo Router

## Example: Complete Expo App

```tsx
// App.tsx
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView } from 'react-native';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { colors } from './designTokens';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView>
        <Card />
        <Button />
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
```

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [styled-components Documentation](https://styled-components.com/docs/basics#react-native)

## Summary

✅ **100% Expo Compatible**
- No native modules required
- Works in Expo Go
- All styling options supported
- TypeScript ready
- Expo Web compatible
- Zero configuration needed

Generate your Figma designs and use them directly in your Expo app! 🚀
