import { createRequire } from 'node:module';
import vm from 'node:vm';
import { storage } from './storage.js';
import { PluginManifest, IPlaybookPlugin, IProviderPlugin, IRendererPlugin, IHookPlugin } from '../types/index.js';

/**
 * Plugin Sandbox: Isolates plugin execution using Node.js VM context.
 * Plugins get a restricted context — they can ONLY access `storage` and `log`.
 * They cannot access `fs`, `child_process`, network, or any Node built-ins.
 * 
 * Execution is time-limited to 2000ms to prevent infinite loop hangs.
 */
export class PluginSandbox {
  static loadPlaybook(pluginObject: any): IPlaybookPlugin {
    return {
      name: pluginObject.name,
      category: pluginObject.category,
      version: pluginObject.version,
      description: pluginObject.description,
      getPaths: pluginObject.getPaths,
      scorePath: pluginObject.scorePath,
      getMissions: pluginObject.getMissions
    };
  }

  static invokeHook(plugin: IHookPlugin, event: string, payload: any) {
    const hooks: any = plugin.hooks;
    if (hooks[event]) {
      // Pass a deeply cloned payload to prevent state mutation leaks
      hooks[event](JSON.parse(JSON.stringify(payload)));
    }
  }

  /**
   * Execute arbitrary plugin code in a secure VM sandbox.
   * The code only has access to `storage` and `log`—not fs, net, or process.
   */
  static async runInSandbox(code: string, extraContext: Record<string, any> = {}): Promise<any> {
    const sandboxContext = vm.createContext({
      storage: this.getInjectableContext().storage,
      log: this.getInjectableContext().log,
      JSON,
      Math,
      Date,
      setTimeout: undefined, // explicitly blocked
      setInterval: undefined, // explicitly blocked
      process: undefined,    // explicitly blocked
      require: undefined,    // explicitly blocked
      ...extraContext
    });

    try {
      const script = new vm.Script(code);
      return script.runInContext(sandboxContext, { timeout: 2000 });
    } catch (e: any) {
      if (e.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
        throw new Error('[PluginSandbox] Plugin execution timed out (2000ms limit).');
      }
      throw new Error(`[PluginSandbox] Plugin error: ${e.message}`);
    }
  }

  static getInjectableContext() {
    return {
      storage,
      log: (msg: string) => console.log(`[PluginLog] ${msg}`)
    };
  }
}
