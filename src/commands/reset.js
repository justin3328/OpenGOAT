import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { storage } from '../lib/storage.js';
import { C } from '../lib/display.js';

export async function reset() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log(C.neutral('\n⚠ This will delete all missions, earnings, and config.'));
    const confirm = await rl.question(C.primary('Type "DELETE" to confirm: '));

    if (confirm === 'DELETE') {
      storage.reset();
      console.log(C.positive('✓ Data cleared. All systems reset.'));
    } else {
      console.log(C.dim('Reset cancelled.'));
    }
  } catch (error) {
    console.log(C.negative(`✗ Reset failed: ${error.message}`));
  } finally {
    rl.close();
  }
}
