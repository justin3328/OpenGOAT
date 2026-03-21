/**
 * Secret Store: Cross-platform encrypted API key storage.
 * Replaces 'keytar' which requires native OS bindings and breaks on Linux/CI.
 * Uses AES-256-CBC encryption with a machine-specific key derived from
 * hostname + username, so keys never sit in plaintext on disk.
 * Falls back to environment variables for headless/CI environments.
 */
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const VAULT_DIR = path.join(os.homedir(), '.opengoat');
const VAULT_FILE = path.join(VAULT_DIR, 'vault.enc');
const ALGORITHM = 'aes-256-cbc';

function getMachineKey(): Buffer {
  const fingerprint = `${os.hostname()}::${os.userInfo().username}::opengoat-v1`;
  return crypto.createHash('sha256').update(fingerprint).digest();
}

function readVault(): Record<string, string> {
  try {
    if (!fs.existsSync(VAULT_FILE)) return {};
    const raw = fs.readFileSync(VAULT_FILE, 'utf-8');
    const { iv, data } = JSON.parse(raw) as { iv: string; data: string };
    const key = getMachineKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
    const decrypted = decipher.update(data, 'hex', 'utf-8') + decipher.final('utf-8');
    return JSON.parse(decrypted);
  } catch {
    return {};
  }
}

function writeVault(vault: Record<string, string>): void {
  if (!fs.existsSync(VAULT_DIR)) fs.mkdirSync(VAULT_DIR, { recursive: true });
  const key = getMachineKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = cipher.update(JSON.stringify(vault), 'utf-8', 'hex') + cipher.final('hex');
  fs.writeFileSync(VAULT_FILE, JSON.stringify({ iv: iv.toString('hex'), data: encrypted }), 'utf-8');
}

export const SecretStore = {
  /**
   * Save an API key for a service. Encrypted on disk.
   */
  set(service: string, key: string, value: string): void {
    const vault = readVault();
    vault[`${service}::${key}`] = value;
    writeVault(vault);
  },

  /**
   * Get an API key. Checks env vars first (CI/headless compat), then vault.
   */
  get(service: string, key: string): string | null {
    // Check env vars first: OPENGOAT_API_KEY_GROQ, OPENGOAT_API_KEY_ANTHROPIC, etc.
    const envKey = `OPENGOAT_API_KEY_${key.toUpperCase()}`;
    if (process.env[envKey]) return process.env[envKey]!;

    const vault = readVault();
    return vault[`${service}::${key}`] || null;
  },

  /**
   * Delete an API key from the vault.
   */
  delete(service: string, key: string): void {
    const vault = readVault();
    delete vault[`${service}::${key}`];
    writeVault(vault);
  },

  /**
   * Returns true if a key exists in env or vault.
   */
  has(service: string, key: string): boolean {
    return this.get(service, key) !== null;
  }
};
