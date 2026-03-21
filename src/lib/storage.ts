import Conf from 'conf';
import type { IStorageAdapter } from '../types/index.js';

class DefaultStorageAdapter implements IStorageAdapter {
  name = 'DefaultConf';
  version = '1.0.0';
  private store: Conf;

  constructor() {
    this.store = new Conf({ projectName: 'opengoat' });
  }

  get<T>(key: string): T | undefined {
    return this.store.get(key) as T;
  }

  set<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  getAll(): Record<string, unknown> {
    return this.store.store;
  }
}

export const storage = new DefaultStorageAdapter();
