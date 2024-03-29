import { expect, describe, it } from 'bun:test';
import { Losso } from './losso.ts';

class StorageInMemory implements Storage {
  storage: Record<string, string> = {};
  setItem(name: string, value: string) {
    this.storage[name] = value;
  }
  getItem(name: string) {
    return this.storage[name] ?? null;
  }
  removeItem(name: string) {
    delete this.storage[name];
  }
  clear() {
    this.storage = {};
  }
  key(index: number): string | null {
    const keys = Object.keys(this.storage);
    return keys[index] ?? null;
  }
  get length() {
    return Object.keys(this.storage).length;
  }
}

describe('losso', () => {
  describe('set', () => {
    it('set str', () => {
      const localStorage = new StorageInMemory();

      const losso = Losso.new({
        version: 'v0.0.1',
        localStorage,
      });

      losso.set('hello', 'world');

      const nowBefore = new Date().getTime() - 1000;
      const nowAfter = new Date().getTime() + 1000;

      const helloConfig = JSON.parse(localStorage.getItem(Losso.configName))
        .configs.hello;
      const updatedTime = new Date(helloConfig.updatedTime).getTime();

      expect(localStorage.getItem('hello')).toBe('world');
      expect(typeof helloConfig === 'object').toBe(true);
      expect(typeof helloConfig !== null).toBe(true);
      expect(helloConfig.version).toBe('v0.0.1');
      expect(helloConfig.stringType).toBe(true);
      expect(updatedTime > nowBefore).toBe(true);
      expect(updatedTime < nowAfter).toBe(true);
    });
    it('set obj', () => {
      const localStorage = new StorageInMemory();

      const losso = Losso.new({
        version: 'v0.0.1',
        localStorage,
      });

      losso.set('hello', { ping: 'pong' });

      expect(JSON.parse(localStorage.getItem('hello')).ping).toBe('pong');
    });
    it('update', () => {
      const localStorage = new StorageInMemory();

      const losso = Losso.new({
        version: 'v0.0.1',
        localStorage,
      });

      losso.set('hello', 'world');

      const losso2 = Losso.new({
        version: 'v0.0.2',
        localStorage,
      });

      losso2.set('hello', 'world2');
      const helloConfig = JSON.parse(localStorage.getItem(Losso.configName))
        .configs.hello;

      expect(helloConfig.version).toBe('v0.0.2');

      const value = localStorage.getItem('hello');
      expect(value).toBe('world2');
    });
  });
  describe('get', () => {
    it('str', () => {
      const localStorage = new StorageInMemory();

      const losso = Losso.new({
        version: 'v0.0.1',
        localStorage,
      });

      losso.set('hello', 'world');

      const value = losso.get('hello');
      expect(value).toBe('world');
    });

    it('obj', () => {
      const localStorage = new StorageInMemory();

      const losso = Losso.new({
        version: 'v0.0.1',
        localStorage,
      });

      losso.set('hello', { ping: 'pong' });

      const value = losso.get('hello');
      expect(value.ping).toBe('pong');
    });

    it('no meta', () => {
      const localStorage = new StorageInMemory();

      const losso = Losso.new({
        version: 'v0.0.1',
        localStorage,
      });

      losso.set('hello', { ping: 'pong' });

      localStorage.setItem(
        Losso.configName,
        JSON.stringify({ varsion: '0.0.0', configs: {} })
      );

      const value = losso.get('hello');
      expect(value).toBe(null);
    });
  });
});
