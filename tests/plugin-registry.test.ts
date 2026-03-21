import { describe, it, expect, beforeEach } from 'vitest';
import { registry } from '../src/plugins/registry.js';
import path from 'node:path';
import fs from 'node:fs';

describe('Plugin Registry v2', () => {
  it('should throw if manifest is missing', async () => {
    await expect(registry.register('/non/existent')).rejects.toThrow();
  });
});
