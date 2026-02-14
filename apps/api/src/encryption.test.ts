import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from './encryption';

// Ensure we have a key for tests if .env.test isn't picked up automatically by vitest in some environments
if (!process.env.ENCRYPTION_KEY) {
    process.env.ENCRYPTION_KEY = 'bcde821f621d6bebf62745d47316d44ff278ad5aa78dc2cbb512551e7c614e0d';
}

describe('Encryption Utility', () => {
    it('should encrypt and decrypt data correctly', () => {
        const payload = { amount: 100, currency: 'USD', recipient: 'Alice' };
        const encrypted = encrypt(payload);

        expect(encrypted).toContain(':');
        const parts = encrypted.split(':');
        expect(parts.length).toBe(3); // iv:authTag:encryptedData

        const decrypted = decrypt(encrypted);
        expect(decrypted).toEqual(payload);
    });

    it('should produce different outputs for same input (due to random IV)', () => {
        const payload = { data: 'test' };
        const enc1 = encrypt(payload);
        const enc2 = encrypt(payload);

        expect(enc1).not.toEqual(enc2);

        expect(decrypt(enc1)).toEqual(payload);
        expect(decrypt(enc2)).toEqual(payload);
    });

    it('should throw error on invalid format', () => {
        expect(() => decrypt('invalid stuff')).toThrow();
    });

    it('should throw error on tampered data (auth tag mismatch)', () => {
        const payload = { secret: 'data' };
        const encrypted = encrypt(payload);
        const [iv, authTag, data] = encrypted.split(':');

        // Tamper with data
        const tamperedData = data.substring(0, data.length - 2) + '00';
        const tamperedString = iv + ':' + authTag + ':' + tamperedData;

        expect(() => decrypt(tamperedString)).toThrow();
    });
});
