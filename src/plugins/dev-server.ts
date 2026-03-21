import chokidar from 'chokidar';
import { registry } from './registry.js';
import path from 'node:path';

export async function startDevServer(pluginPath: string) {
  console.log(`Starting plugin dev server for: ${pluginPath}`);
  
  const watcher = chokidar.watch(pluginPath, {
    ignored: /node_modules|\.git/,
    persistent: true
  });

  watcher.on('change', async (filePath) => {
    console.log(`Reloading plugin due to change: ${path.basename(filePath)}`);
    try {
      await registry.register(pluginPath);
      console.log(`Success: Plugin reloaded at ${new Date().toLocaleTimeString()}`);
    } catch (e: any) {
      console.error(`Reload failed: ${e.message}`);
    }
  });

  process.on('SIGINT', () => {
    watcher.close();
    process.exit();
  });
}
