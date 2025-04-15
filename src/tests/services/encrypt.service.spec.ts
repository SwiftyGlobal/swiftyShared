import { EncryptService } from '../../services';

describe('EncryptService', () => {
  const encryptService = EncryptService.getInstance();

  it('encrypts and decrypts a single string correctly', () => {
    const text = 'hello world';
    const encrypted = encryptService.encryptText(text);
    const decrypted = encryptService.decryptText(encrypted);
    expect(decrypted).toBe(text);
  });

  it('encrypts and decrypts a number correctly', () => {
    const text = 1;
    const encrypted = encryptService.encryptText(text);
    const decrypted = encryptService.decryptText(encrypted);
    expect(decrypted).toBe(text.toString());
  });

  it('encrypts and decrypts an array of values correctly', () => {
    const texts = ['hello', 'world', '123', 123, null, undefined];
    const encrypted = encryptService.encryptText(texts);
    const decrypted = encryptService.decryptText(encrypted);
    expect(decrypted).toEqual(texts);
  });

  it('returns empty string when encrypting or decrypting an empty string', () => {
    expect(encryptService.encryptText('')).toBe('');
    expect(encryptService.decryptText('')).toBe('');
  });

  it('handles null or undefined values gracefully during encryption and decryption', () => {
    expect(encryptService.encryptText(null)).toBe('');
    expect(encryptService.decryptText(null)).toBe(null);
    expect(encryptService.encryptText(undefined)).toBe('');
    expect(encryptService.decryptText(undefined)).toBe(undefined);
  });

  it('encrypts and decrypts an object with nested values correctly', () => {
    const obj = { key1: 'value1', key2: { nestedKey: 'nestedValue' } };
    const encrypted = encryptService.encryptObject(obj);
    const decrypted = encryptService.decryptObject(encrypted);
    expect(decrypted).toEqual(obj);
  });

  it('handles objects with null or undefined values during encryption and decryption', () => {
    const obj = { key1: null, key2: undefined };
    const encrypted = encryptService.encryptObject(obj);
    const decrypted = encryptService.decryptObject(encrypted);
    expect(decrypted).toEqual({ key1: null, key2: null });
  });

  it('returns the original text if decryption fails', () => {
    const invalidEncryptedText = 'invalidEncryptedText';
    expect(encryptService.decryptText(invalidEncryptedText)).toBe(invalidEncryptedText);
  });
});
