import EventEmitter from 'node:events';

export type HookName =
  | 'before:init'
  | 'after:init'
  | 'before:plan'
  | 'after:plan'
  | 'on:mission-complete'
  | 'on:mission-missed'
  | 'on:goal-reached'
  | 'before:score'
  | 'after:score'
  | 'on:week-recalibrate';

class GoatEventBus extends EventEmitter {
  override emit(event: HookName, ...args: unknown[]): boolean {
    return super.emit(event, ...args);
  }
  override on(event: HookName, listener: (...args: unknown[]) => void): this {
    return super.on(event, listener);
  }
}

export const eventBus = new GoatEventBus();
