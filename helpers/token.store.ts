/// <reference types="node" />

import * as fs from 'fs';
import * as path from 'path';

const TOKEN_FILE = path.resolve(process.cwd(), 'test-results', 'auth_token.json');

function isLikelyToken(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length >= 16;
}

/** Persist the auth token to disk (no-op when it already matches). */
export function setAuthToken(token: string): void {
  if (!isLikelyToken(token)) {
    console.error('Refusing to persist invalid auth token payload.');
    return;
  }

  try {
    const current = getAuthToken();
    if (current === token) return;

    fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });

    const tmpFile = `${TOKEN_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify({ token }, null, 2), 'utf-8');
    fs.renameSync(tmpFile, TOKEN_FILE);
  } catch (error) {
    console.error('Failed to persist auth token to disk:', error);
  }
}

/** Read the persisted auth token, or null when none is available. */
export function getAuthToken(): string | null {
  try {
    const raw = fs.readFileSync(TOKEN_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as { token?: unknown };

    if (!isLikelyToken(parsed.token)) {
      console.error('Auth token file exists but payload is invalid.');
      return null;
    }

    return parsed.token;
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
      console.error('Failed to read auth token from disk:', error);
    }
    return null;
  }
}

/** Remove the persisted auth token, if present. */
export function clearAuthToken(): void {
  try {
    fs.rmSync(TOKEN_FILE, { force: true });
  } catch (error) {
    console.error('Failed to clear auth token file:', error);
  }
}

export default { setAuthToken, getAuthToken, clearAuthToken };
