// Mock do expo-image-picker para testes em ambiente Node
export const launchImageLibraryAsync = jest.fn(async () => ({ canceled: true }));
export const launchCameraAsync = jest.fn(async () => ({ canceled: true }));
