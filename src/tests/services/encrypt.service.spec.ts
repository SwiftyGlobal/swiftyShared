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

  it('encrypts a string using encrypt method directly', () => {
    delete (EncryptService as any).instance;
    process.env.encrypt_secret_key = '12345678901234567890123456789012';
    process.env.encrypt_iv = '1234567890123456';

    const service = EncryptService.getInstance();

    const input = 'secret message';
    const result = service.encrypt(input);

    expect(typeof result).toBe('string');
    expect(result).not.toBe(input);
  });

  it('returns original text when decrypt throws an error (covers catch block)', () => {
    const service = EncryptService.getInstance();

    const decryptMock = jest.spyOn(service, 'decrypt').mockImplementation(() => {
      throw new Error('Forced decryption error');
    });

    const input = 'some-encrypted-text';
    const result = service.decryptText(input);

    expect(result).toBe(input);

    decryptMock.mockRestore();
  });

  it('returns original array when decrypt throws an error (covers catch block for arrays)', () => {
    const service = EncryptService.getInstance();

    jest.spyOn(service, 'decrypt').mockImplementation(() => {
      throw new Error('Forced decryption error');
    });

    const inputArray = ['text1', 'text2'];
    const result = service.decryptText(inputArray);

    expect(result).toEqual(inputArray);

    jest.restoreAllMocks();
  });

  it('encrypts and decrypts a string successfully', () => {
    const service = EncryptService.getInstance();

    const originalText = 'secret message';

    const encryptedText = service.encrypt(originalText);

    expect(encryptedText).not.toBe(originalText);
    expect(typeof encryptedText).toBe('string');

    const decryptedText = service.decrypt(encryptedText);

    expect(decryptedText).toBe(originalText);
  });

  it('converts number property to string before encryption in encryptObject', () => {
    const service = EncryptService.getInstance();

    const input = {
      age: 42,
      name: 'Alice',
    };

    const encryptedObj = service.encryptObject(input);

    expect(typeof encryptedObj.age).toBe('string');
    expect(encryptedObj.age).not.toBe('42');

    expect(typeof encryptedObj.name).toBe('string');
    expect(encryptedObj.name).not.toBe('Alice');
  });

  it('converts number property to string before decryption in decryptObject', () => {
    const service = EncryptService.getInstance();

    jest.spyOn(service, 'decryptText').mockImplementation((val) => `decrypted:${val}`);

    const input = {
      encryptedNumber: 12345,
      encryptedString: 'abcdef',
    };

    const decryptedObj = service.decryptObject(input);

    expect(service.decryptText).toHaveBeenCalledWith('12345');
    expect(service.decryptText).toHaveBeenCalledWith('abcdef');

    expect(typeof decryptedObj.encryptedNumber).toBe('string');
    expect(decryptedObj.encryptedNumber).toBe('decrypted:12345');

    expect(typeof decryptedObj.encryptedString).toBe('string');
    expect(decryptedObj.encryptedString).toBe('decrypted:abcdef');

    (service.decryptText as jest.Mock).mockRestore();
  });
});
