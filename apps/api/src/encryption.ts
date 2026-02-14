import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
}

// Ensure key is Buffer of 32 bytes
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

if (KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
}

export interface EncryptedPayload {
    data: string; // serialized format: iv:authTag:encryptedContent
}

export const encrypt = (data: any): string => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

export const decrypt = (encryptedString: string): any => {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted format. Expected iv:authTag:encryptedData');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        KEY,
        Buffer.from(ivHex, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
};
