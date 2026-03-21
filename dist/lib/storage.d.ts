import type { IStorageAdapter } from '../types/index.js';
declare class DefaultStorageAdapter implements IStorageAdapter {
    name: string;
    version: string;
    private store;
    constructor();
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T): void;
    delete(key: string): void;
    clear(): void;
    getAll(): Record<string, unknown>;
}
export declare const storage: DefaultStorageAdapter;
export {};
