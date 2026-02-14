import 'dotenv/config';
import { encrypt, decrypt } from './encryption';

const testData = {
    amount: 100,
    currency: 'USD',
    recipient: 'Test User',
    type: 'PAYMENT'
};

try {
    console.log('Testing encryption...');
    const encrypted = encrypt(testData);
    console.log('Encrypted payload:', encrypted);

    console.log('Testing decryption...');
    const decrypted = decrypt(encrypted);
    console.log('Decrypted data:', decrypted);

    if (JSON.stringify(decrypted) === JSON.stringify(testData)) {
        console.log('SUCCESS: Encryption/Decryption roundtrip passed!');
    } else {
        console.error('FAILURE: Data mismatch!');
    }
} catch (error) {
    console.error('ERROR during testing:', error);
}
