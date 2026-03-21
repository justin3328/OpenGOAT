import Conf from 'conf';
class DefaultStorageAdapter {
    name = 'DefaultConf';
    version = '1.0.0';
    store;
    constructor() {
        this.store = new Conf({ projectName: 'opengoat' });
    }
    get(key) {
        return this.store.get(key);
    }
    set(key, value) {
        this.store.set(key, value);
    }
    delete(key) {
        this.store.delete(key);
    }
    clear() {
        this.store.clear();
    }
    getAll() {
        return this.store.store;
    }
}
export const storage = new DefaultStorageAdapter();
