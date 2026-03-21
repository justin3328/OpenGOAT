import EventEmitter from 'node:events';
class GoatEventBus extends EventEmitter {
    emit(event, ...args) {
        return super.emit(event, ...args);
    }
    on(event, listener) {
        return super.on(event, listener);
    }
}
export const eventBus = new GoatEventBus();
