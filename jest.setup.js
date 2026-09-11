/* eslint-disable */
// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    PanGestureHandler: View,
    State: {},
    Directions: {},
    gestureHandlerRootHOC: (c: any) => c,
    Gesture: {
      Pan: () => ({
        onUpdate: () => ({ onEnd: () => ({}) }),
        onEnd: () => ({}),
        onStart: () => ({}),
      }),
      Tap: () => ({
        onEnd: () => ({}),
      }),
    },
    GestureDetector: View,
  };
});

// Mock MMKV
jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    createMMKV: () => ({
      set: (key, value) => store.set(key, value),
      getString: (key) => store.get(key) ?? undefined,
      getNumber: (key) => store.get(key) ?? undefined,
      getBoolean: (key) => store.get(key) ?? undefined,
      contains: (key) => store.has(key),
      remove: (key) => store.delete(key),
      clearAll: () => store.clear(),
      getAllKeys: () => Array.from(store.keys()),
    }),
  };
});