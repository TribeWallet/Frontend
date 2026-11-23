// Mock do react-native-reanimated para testes em ambiente Node
// O módulo original é ESM e não pode ser carregado pelo Jest em CJS
import React from 'react';

export const Animated = {
  View: React.createElement('animated-view-mock', {}),
  Text: React.createElement('animated-text-mock', {}),
  createAnimatedComponent: (component: any) => component,
};

export const useSharedValue = (value: any) => ({ value });
export const useAnimatedStyle = (style: any) => ({});
export const withRepeat = (animation: any) => animation;
export const withTiming = (value: any, config?: any) => value;
export const withSpring = (value: any, config?: any) => value;
export const withDelay = (delay: any, animation: any) => animation;
export const runOnJS = (fn: any) => fn;
export const runOnUI = (fn: any) => fn;
export const cancelAnimation = (id: any) => {};
export const start = (animation: any, callback?: any) => {};
export const stopAnimation = (style: any) => {};

export default {
  Animated,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
  runOnUI,
  cancelAnimation,
  start,
  stopAnimation,
};
