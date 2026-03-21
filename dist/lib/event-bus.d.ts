import EventEmitter from 'node:events';
export type HookName = 'before:init' | 'after:init' | 'before:plan' | 'after:plan' | 'on:mission-complete' | 'on:mission-missed' | 'on:goal-reached' | 'before:score' | 'after:score' | 'on:week-recalibrate';
declare class GoatEventBus extends EventEmitter {
    emit(event: HookName, ...args: unknown[]): boolean;
    on(event: HookName, listener: (...args: unknown[]) => void): this;
}
export declare const eventBus: GoatEventBus;
export {};
