// Mock do react-native-safe-area-context para testes em ambiente Node
import React from 'react';

export const SafeAreaView = React.forwardRef((props, ref) => {
  const { children, style, edges, ...rest } = props;
  return React.createElement('safeareaview-mock', { ref, ...rest }, children);
});
SafeAreaView.displayName = 'SafeAreaView';

export const SafeAreaProvider = ({ children }) => children;

export const useSafeAreaInsets = () => ({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

export const useSafeAreaFrame = () => ({
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
});

export const SafeAreaInsetsContext = React.createContext({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

export default {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
  useSafeAreaFrame,
  SafeAreaInsetsContext,
};
