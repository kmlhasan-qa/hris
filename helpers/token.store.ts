/// <reference types="node" />

import * as fs from 'fs';
import * as path from 'path';

const TOKEN_FILE = path.resolve(process.cwd(), 'test-results', 'auth_token.json');

export function setAuthToken(token: string) {
  try {
    fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token }, null, 2), { encoding: 'utf-8' });
  } catch (e) {
    // ignore write errors in tests
  }
}

export function getAuthToken(): string | null {
  try {
    const raw = fs.readFileSync(TOKEN_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch (e) {
    return null;
  }
}

export function clearAuthToken() {
  try {
    if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE);
  } catch (e) {
    // ignore
  }
}

export default {
  setAuthToken,
  getAuthToken,
  clearAuthToken,
};
