import crypto from 'crypto';
import { RECOVERY_CODES_COUNT } from '@storyforge/shared';
import { logger } from '../config/logger';

export interface GeneratedSecret {
  secret: string;
  otpauthUrl: string;
  recoveryCodes: string[];
}

export class TwoFactorService {
  /**
   * Generate a new 2FA secret, otpauth URL, and recovery codes.
   */
  generateSecret(userEmail: string): GeneratedSecret {
    const secretBuffer = crypto.randomBytes(20);
    const secret = this.base32Encode(secretBuffer);

    const issuer = 'StoryForgeAI';
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;

    const recoveryCodes = Array.from({ length: RECOVERY_CODES_COUNT }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    return { secret, otpauthUrl, recoveryCodes };
  }

  /**
   * Verify a 6-digit TOTP code against a secret.
   * Allows window drift of ±1 (30 seconds before or after).
   */
  verifyTotp(token: string, secret: string): boolean {
    const cleanToken = token.trim();
    if (!/^\d{6}$/.test(cleanToken)) return false;

    const currentTime = Math.floor(Date.now() / 1000 / 30);

    for (let errorWindow = -1; errorWindow <= 1; errorWindow++) {
      const generated = this.generateHOTP(secret, currentTime + errorWindow);
      if (crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(cleanToken))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Hash recovery codes before saving in database.
   */
  async hashRecoveryCodes(codes: string[]): Promise<string[]> {
    return codes.map((code) =>
      crypto.createHash('sha256').update(code.toUpperCase()).digest('hex')
    );
  }

  /**
   * Verify and consume a recovery code.
   */
  async verifyAndConsumeRecoveryCode(
    enteredCode: string,
    hashedCodes: string[]
  ): Promise<{ isValid: boolean; remainingCodes: string[] }> {
    const hashedEntered = crypto.createHash('sha256').update(enteredCode.trim().toUpperCase()).digest('hex');
    const index = hashedCodes.indexOf(hashedEntered);

    if (index === -1) {
      return { isValid: false, remainingCodes: hashedCodes };
    }

    const remainingCodes = [...hashedCodes];
    remainingCodes.splice(index, 1);
    return { isValid: true, remainingCodes };
  }

  // ─── Internal Cryptographic Helpers ─────────────────────────────────────────

  private generateHOTP(secretBase32: string, counter: number): string {
    const key = this.base32Decode(secretBase32);
    const buf = Buffer.alloc(8);
    let tmp = counter;
    for (let i = 7; i >= 0; i--) {
      buf[i] = tmp & 0xff;
      tmp = tmp >> 8;
    }

    const hmac = crypto.createHmac('sha1', key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const strCode = (code % 1000000).toString();
    return strCode.padStart(6, '0');
  }

  private base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;
      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }
    return output;
  }

  private base32Decode(base32Str: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const cleanStr = base32Str.toUpperCase().replace(/[^A-Z2-7]/g, '');
    let bits = 0;
    let value = 0;
    const output: number[] = [];

    for (let i = 0; i < cleanStr.length; i++) {
      const idx = alphabet.indexOf(cleanStr[i]);
      if (idx === -1) continue;
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    return Buffer.from(output);
  }
}

export const twoFactorService = new TwoFactorService();
