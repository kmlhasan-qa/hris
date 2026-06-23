/// <reference types="node" />

import * as fs from 'fs';
import * as path from 'path';

const TOKEN_FILE = path.resolve(process.cwd(), 'test-results', 'auth_token.json');

/** Persist the auth token to disk (no-op when it already matches). */
export function setAuthToken(token: string): void {
  try {
    if (getAuthToken() === token) return;
    fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token }, null, 2), 'utf-8');
  } catch {
    // Ignore write errors during tests.
  }
}

/** Read the persisted auth token, or null when none is available. */
export function getAuthToken(): string | null {
  try {
    const { token } = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
    return token ?? null;
  } catch {
    return null;
  }
}

/** Remove the persisted auth token, if present. */
export function clearAuthToken(): void {
  try {
    fs.rmSync(TOKEN_FILE, { force: true });
  } catch {
    // Ignore.
  }
}

export default { setAuthToken, getAuthToken, clearAuthToken };
