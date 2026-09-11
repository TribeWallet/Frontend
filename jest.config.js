module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation|@shopify/restyle|@shopify/flash-list|react-native-mmkv|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-svg|@tanstack/react-query|zustand|react-hook-form|zod)',
  ],
};
