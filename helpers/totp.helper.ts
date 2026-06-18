import * as crypto from 'crypto';

function base32ToBuffer(base32: string) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  base32 = base32.replace(/=+$/g, '').toUpperCase();
  for (let i = 0; i < base32.length; i++) {
    const idx = alphabet.indexOf(base32[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 0xff);
    }
  }
  return Buffer.from(bytes);
}

export function generateTOTP(secret: string, digits = 6, step = 30) {
  const key = base32ToBuffer(secret);
  const epoch = Math.floor(Date.now() / 1000 / step);
  const msg = Buffer.alloc(8);
  msg.writeUInt32BE(Math.floor(epoch / 0x100000000), 0);
  msg.writeUInt32BE(epoch >>> 0, 4);

  const hmac = crypto.createHmac('sha1', key).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (code % Math.pow(10, digits)).toString().padStart(digits, '0');
  return otp;
}

export default generateTOTP;
