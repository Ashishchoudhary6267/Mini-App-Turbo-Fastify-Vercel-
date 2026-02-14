// Browser-compatible encryption utility
const ALGORITHM = 'AES-GCM';

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

async function getKey(): Promise<CryptoKey> {
    const keyHex = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
    if (!keyHex) {
        throw new Error('NEXT_PUBLIC_ENCRYPTION_KEY is missing');
    }
    const keyBytes = hexToBytes(keyHex);

    return window.crypto.subtle.importKey(
        'raw',
        keyBytes as any,
        ALGORITHM,
        false,
        ['encrypt']
    );
}

export async function encryptData(data: any): Promise<string> {
    const key = await getKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
            name: ALGORITHM,
            iv: iv,
        },
        key,
        encodedData
    );

    const encryptedArray = new Uint8Array(encryptedBuffer);

    // Web Crypto API AES-GCM appends the auth tag to the end of the ciphertext?
    // No, actually Web Crypto encrypt returns the ciphertext with the tag appended at the end.
    // Node.js crypto.createCipheriv + getAuthTag separates them.
    // We need to match Node.js format: iv:authTag:encryptedData

    // In Web Crypto output: [Ciphertext.... | Tag (usually 16 bytes)]

    const tagLength = 16;
    const ciphertextLength = encryptedArray.length - tagLength;

    const ciphertext = encryptedArray.slice(0, ciphertextLength);
    const authTag = encryptedArray.slice(ciphertextLength); // Last 16 bytes

    return bytesToHex(iv) + ':' + bytesToHex(authTag) + ':' + bytesToHex(ciphertext);
}
