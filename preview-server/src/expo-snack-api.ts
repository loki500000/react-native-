/**
 * Expo Snack API Integration
 * Creates and manages Expo Snack projects for live preview
 */

import axios from 'axios';

export interface SnackFile {
  type: 'CODE';
  contents: string;
}

export interface SnackFiles {
  [key: string]: SnackFile;
}

export class ExpoSnackAPI {
  private baseURL = 'https://exp.host/--/api/v2/snack';

  /**
   * Create or update a Snack
   */
  async createOrUpdateSnack(name: string, files: Record<string, string>): Promise<string> {
    const snackFiles: SnackFiles = {};

    // Convert files to Snack format
    Object.entries(files).forEach(([path, content]) => {
      snackFiles[path] = {
        type: 'CODE',
        contents: content,
      };
    });

    // Add default App.js if not present
    if (!snackFiles['App.js'] && !snackFiles['App.tsx']) {
      snackFiles['App.tsx'] = {
        type: 'CODE',
        contents: this.getDefaultApp(files),
      };
    }

    // Add package.json if not present
    if (!snackFiles['package.json']) {
      snackFiles['package.json'] = {
        type: 'CODE',
        contents: JSON.stringify(this.getDefaultPackageJson(), null, 2),
      };
    }

    try {
      const response = await axios.post(`${this.baseURL}/save`, {
        name: name || 'Figma Studio AI Preview',
        files: snackFiles,
        dependencies: this.getDefaultDependencies(),
        sdkVersion: '49.0.0', // Latest Expo SDK
      });

      return `https://snack.expo.dev/${response.data.id}`;
    } catch (error) {
      console.error('Error creating Snack:', error);
      throw new Error('Failed to create Expo Snack preview');
    }
  }

  /**
   * Generate default App component that imports generated components
   */
  private getDefaultApp(files: Record<string, string>): string {
    const componentFiles = Object.keys(files).filter(
      (f) => f.endsWith('.tsx') || f.endsWith('.jsx')
    );

    const imports = componentFiles
      .map((file) => {
        const componentName = file.replace(/\.(tsx|jsx)$/, '');
        return `import ${componentName} from './${componentName}';`;
      })
      .join('\n');

    return `
import React from 'react';
import { View, StyleSheet } from 'react-native';
${imports}

export default function App() {
  return (
    <View style={styles.container}>
      {/* Generated components will render here */}
      {/* You can customize this App.tsx */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
    `.trim();
  }

  /**
   * Default package.json for Snack
   */
  private getDefaultPackageJson() {
    return {
      dependencies: {
        'react-native-paper': '5.11.1',
        'react-native-vector-icons': '*',
        '@expo/vector-icons': '*',
        'expo-constants': '~15.4.0',
      },
    };
  }

  /**
   * Default dependencies
   */
  private getDefaultDependencies() {
    return {
      'react-native-paper': '5.11.1',
      'react-native-vector-icons': 'latest',
      '@expo/vector-icons': 'latest',
    };
  }
}
