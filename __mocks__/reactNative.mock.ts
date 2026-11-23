// Mock expandido do React Native para testes com @testing-library/react-native
// Fornece componentes básicos que podem ser renderizados em ambiente Node

import React from 'react';
import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';

// Componentes mockados básicos que aceitam children e props
export const View = React.forwardRef((props, ref) => {
  const { children, style, ...rest } = props;
  return React.createElement('view-mock', { ref, ...rest }, children);
});
View.displayName = 'View';

export const Text = React.forwardRef((props, ref) => {
  const { children, style, ...rest } = props;
  return React.createElement('Text', { ref, ...rest }, children);
});
Text.displayName = 'Text';

export const Pressable = React.forwardRef((props, ref) => {
  const { children, onPress, disabled, style, accessibilityLabel, ...rest } = props;
  return React.createElement('pressable-mock', {
    ref,
    onPress,
    disabled,
    accessibilityLabel,
    ...rest,
  }, children);
});
Pressable.displayName = 'Pressable';

export const TextInput = React.forwardRef((props, ref) => {
  const { value, onChangeText, placeholder, secureTextEntry, style, ...rest } = props;
  return React.createElement('textinput-mock', {
    ref,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    ...rest,
  });
});
TextInput.displayName = 'TextInput';

export const ScrollView = React.forwardRef((props, ref) => {
  const { children, style, ...rest } = props;
  return React.createElement('scrollview-mock', { ref, ...rest }, children);
});
ScrollView.displayName = 'ScrollView';

export const ActivityIndicator = React.forwardRef((props, ref) => {
  const { color, size, style, ...rest } = props;
  return React.createElement('activityindicator-mock', { ref, ...rest });
});
ActivityIndicator.displayName = 'ActivityIndicator';

export const SafeAreaView = React.forwardRef((props, ref) => {
  const { children, style, edges, ...rest } = props;
  return React.createElement('safeareaview-mock', { ref, ...rest }, children);
});
SafeAreaView.displayName = 'SafeAreaView';

export const StatusBar = React.forwardRef((props, ref) => {
  return React.createElement('statusbar-mock', { ref, ...props });
});
StatusBar.displayName = 'StatusBar';

export const KeyboardAvoidingView = React.forwardRef((props, ref) => {
  const { children, behavior, style, ...rest } = props;
  return React.createElement('keyboardavoidingview-mock', { ref, ...rest }, children);
});
KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export const TouchableOpacity = React.forwardRef((props, ref) => {
  const { children, onPress, activeOpacity, hitSlop, accessibilityLabel, ...rest } = props;
  return React.createElement('touchableopacity-mock', {
    ref,
    onPress,
    activeOpacity,
    hitSlop,
    accessibilityLabel,
    ...rest,
  }, children);
});
TouchableOpacity.displayName = 'TouchableOpacity';

export const Alert = {
  alert: jest.fn(),
};

export const AppState = {
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
  currentState: 'active',
};

export const Platform = {
  OS: 'ios',
  select: jest.fn((obj) => obj.ios ?? obj.default),
};

export const Dimensions = {
  get: jest.fn(() => ({ width: 375, height: 812 })),
  set: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

export const PixelRatio = {
  get: jest.fn(() => 1),
  getFontScale: jest.fn(() => 1),
  roundToNearestPixel: jest.fn((x) => x),
  startDetecting: jest.fn(),
  stopDetecting: jest.fn(),
};

export const StyleSheet = {
  create: (styles: any) => styles,
  flatten: (style: any) => style,
  hairlineWidth: 1,
  absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  absoluteFillObject: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
};

export const processColor = jest.fn((color) => color);

export const useWindowDimensions = jest.fn(() => ({ width: 375, height: 812 }));

export const Linking = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  openURL: jest.fn(async () => ({ type: 'success' })),
  canOpenURL: jest.fn(async () => true),
  getInitialURL: jest.fn(async () => null),
  popInitialURL: jest.fn(),
  sendIntent: jest.fn(async () => ({ type: 'success' })),
};

export default {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
  AppState,
  Platform,
  Dimensions,
  PixelRatio,
  Linking,
};
