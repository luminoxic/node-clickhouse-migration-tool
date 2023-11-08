import crypto from 'crypto';

export class CryptoUtils {
    static hash(content: string): { data?: any, errors?: Error[] } {
        const result: { data?: any, errors?: Error[] } = {};

        try {
            result.data = crypto.createHash('sha256').update(content).digest('hex');
        } catch (err) {
            result.errors = [err];
        }

        return result;
    }
}
