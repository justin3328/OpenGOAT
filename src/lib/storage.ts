import Conf from 'conf';
import type { IStorageAdapter } from '../types/index.js';

class DefaultStorageAdapter implements IStorageAdapter {
  name = 'DefaultConf';
  version = '1.0.0';
  private store: Conf;

  constructor() {
    this.store = new Conf({ projectName: 'opengoat' });
  }

  async initialize(): Promise<void> {}
  async get<T>(key: string): Promise<T | null> {
    return (this.store.get(key) as T) || null;
  }
  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }
  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    return [];
  }
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return fn();
  }
  async close(): Promise<void> {}
  getAll(): Record<string, unknown> {
    return this.store.store;
  }
}

export const storage: IStorageAdapter = new DefaultStorageAdapter();
