// Setup global de testes - mock de AsyncStorage e APIs do Expo
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = {};
  return {
    getItem: jest.fn(async (key) => (store[key] ?? null)),
    setItem: jest.fn(async (key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn(async (key) => {
      delete store[key];
    }),
    clear: jest.fn(async () => {
      Object.keys(store).forEach((k) => delete store[k]);
    }),
    __store: store,
  };
});

jest.mock('expo-file-system', () => ({
  cacheDir: 'file:///data/user/0/com.tribewallet/cache',
  DirectoryEnum: { CACHE: 'file:///data/user/0/com.tribewallet/cache' },
  writeAsync: jest.fn(),
  readAsync: jest.fn(),
  deleteAsync: jest.fn(),
  File: class {
    constructor(path, filename) {
      this.uri = `${path}/${filename}`;
      this.path = path;
      this.filename = filename;
    }
    async write() {
      return this;
    }
  },
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => {}),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

// Silenciar logs de AVISO do React Native durante testes
const originalError = console.error;
console.error = (...args) => {
  const msg = args.join(' ');
  if (
    msg.includes('Warning:') ||
    msg.includes('ReactNative') ||
    msg.includes('Non-matching')
  ) {
    return;
  }
  originalError(...args);
};
