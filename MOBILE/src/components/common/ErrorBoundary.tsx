/**
 * ErrorBoundary Component
 * Graceful error screen that catches rendering errors
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../../theme';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Log error to error tracking service here (e.g., Sentry)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <ErrorScreen error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorScreenProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onReset }) => {
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? colors.dark.background : colors.light.background },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <Text
          style={[
            styles.title,
            { color: isDarkMode ? colors.dark.text.primary : colors.light.text.primary },
          ]}
        >
          Something went wrong
        </Text>
        <Text
          style={[
            styles.message,
            { color: isDarkMode ? colors.dark.text.secondary : colors.light.text.secondary },
          ]}
        >
          {error?.message || 'An unexpected error occurred'}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.brand[500] }]}
          onPress={onReset}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 150,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
