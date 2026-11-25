// Mock do expo-file-system para testes em ambiente Node
export const cacheDir = 'file:///data/user/0/com.tribewallet/cache';
export const DirectoryEnum = { CACHE: 'file:///data/user/0/com.tribewallet/cache' };
export const writeAsync = jest.fn();
export const readAsync = jest.fn();
export const deleteAsync = jest.fn();
export class File {
  uri: string;
  path: string;
  filename: string;
  constructor(path: string, filename: string) {
    this.path = path;
    this.filename = filename;
    this.uri = `${path}/${filename}`;
  }
  async write() {
    return this;
  }
}
