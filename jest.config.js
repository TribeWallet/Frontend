/** Configuração do Jest para testes de integração frontend-backend (Tribe Wallet) */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { diagnostics: false }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-svg|react-native-vector-icons|expo|@expo|@react-native-community)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['./jest.setup.afterEach.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/asyncStorage.mock.ts',
    '^expo-file-system$': '<rootDir>/__mocks__/expoFileSystem.mock.ts',
    '^expo-sharing$': '<rootDir>/__mocks__/expoSharing.mock.ts',
    '^expo-image-picker$': '<rootDir>/__mocks__/expoImagePicker.mock.ts',
    '^expo-document-picker$': '<rootDir>/__mocks__/expoDocumentPicker.mock.ts',
    '^react-native$': '<rootDir>/__mocks__/reactNative.mock.ts',
    '^react-native-safe-area-context$': '<rootDir>/__mocks__/safeAreaContext.mock.ts',
    '^react-native-svg$': '<rootDir>/__mocks__/reactNativeSvg.mock.ts',
    '^react-native-vector-icons/Feather$': '<rootDir>/__mocks__/reactNativeVectorIcons.mock.ts',
    '^react-native-reanimated$': '<rootDir>/__mocks__/reactNativeReanimated.mock.ts',
    '^@shopify/restyle$': '<rootDir>/__mocks__/restyle.mock.ts',
    '^@react-navigation/native-stack$': '<rootDir>/__mocks__/nativeStack.mock.ts',
    '^test-renderer$': '<rootDir>/__mocks__/test-renderer.js',
  },
  globals: {
    __DEV__: true,
  },
  testTimeout: 30000,
  verbose: true,
};
