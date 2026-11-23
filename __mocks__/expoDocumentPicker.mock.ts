// Mock do expo-document-picker para testes em ambiente Node
export const getDocumentAsync = jest.fn(async () => ({ canceled: true }));
