/**
 * Live Preview App - Main Page
 * Renders generated React Native code in real-time
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import io from 'socket.io-client';

export default function Home() {
  const [components, setComponents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Connect to desktop app via WebSocket
    const socket = io('http://localhost:3002', {
      reconnection: true,
    });

    socket.on('connect', () => {
      console.log('Connected to desktop app');
      setError(null);
    });

    socket.on('code-update', (data) => {
      console.log('Received code update:', data);
      setComponents(data.components);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from desktop app');
      setError('Disconnected from desktop app. Please check if it\'s running.');
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
      setError('Connection error. Please restart the desktop app.');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main style={styles.main}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Figma to React Native - Live Preview</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, error ? styles.statusError : styles.statusActive]} />
          <Text style={styles.statusText}>
            {error ? 'Disconnected' : 'Connected'}
          </Text>
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Preview Area */}
      <ScrollView style={styles.previewContainer}>
        {components.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No components loaded yet.
            </Text>
            <Text style={styles.emptySubtext}>
              Open the desktop app and generate code from Figma to see it here.
            </Text>
          </View>
        ) : (
          <View style={styles.componentsGrid}>
            {components.map((component, index) => (
              <View key={index} style={styles.componentCard}>
                <Text style={styles.componentName}>{component.name}</Text>
                <View style={styles.componentPreview}>
                  {/* Dynamically render the component */}
                  {renderComponent(component)}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Instructions */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Tip: Make changes in the desktop app to see live updates here
        </Text>
      </View>
    </main>
  );
}

function renderComponent(component: any) {
  try {
    // This would dynamically evaluate and render the component
    // For now, show the code
    return (
      <View style={styles.codePlaceholder}>
        <Text style={styles.codeText}>
          {component.code?.substring(0, 200)}...
        </Text>
      </View>
    );
  } catch (err) {
    return (
      <Text style={styles.errorText}>
        Error rendering component
      </Text>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusActive: {
    backgroundColor: '#34C759',
  },
  statusError: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
  },
  previewContainer: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  componentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  componentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    minWidth: 300,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  componentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  componentPreview: {
    minHeight: 100,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  codePlaceholder: {
    padding: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666',
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
});
