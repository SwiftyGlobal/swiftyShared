import * as crypto from 'crypto-browserify';

import type { Nullable } from '../types';
import { isObject } from '../utils';

export class EncryptService {
  private static instance: EncryptService;

  private algorithm = 'aes-256-cbc'; //Using AES encryption

  private encryptIv: string = process.env.encrypt_iv!;

  private encryptSecretKey: string = process.env.encrypt_secret_key!;

  static getInstance(): EncryptService {
    if (!EncryptService.instance) {
      EncryptService.instance = new EncryptService();
    }

    return EncryptService.instance;
  }

  encryptText(text: unknown) {
    try {
      if (Array.isArray(text)) {
        const return_array: string[] = [];

        for (let i = 0; i < text.length; i++) {
          if (text[i]) {
            if (typeof text[i] === 'number') {
              text[i] = text[i].toString();
            }

            return_array.push(this.encrypt(text[i]));
          } else {
            return_array.push(text[i]);
          }
        }

        return return_array;
      } else {
        if (!text) {
          return '';
        }
        return this.encrypt(text);
      }
    } catch (e) {
      return text;
    }
  }

  encrypt(text: unknown) {
    try {
      if (text == null || text === undefined || text === '') return '';

      text = text.toString();

      const initVector = Buffer.from(this.encryptIv, 'utf-8');

      const SecurityKey = Buffer.from(this.encryptSecretKey, 'utf-8');

      const cipher = crypto.createCipheriv(this.algorithm, SecurityKey, initVector);

      let encrypted = cipher.update(text);

      encrypted = Buffer.concat([encrypted, cipher.final()]);

      return encrypted.toString('hex');
    } catch (e) {
      return text;
    }
  }

  decryptText(text: Nullable<string> | unknown) {
    try {
      if (Array.isArray(text)) {
        const return_array: string[] = [];
        for (let i = 0; i < text.length; i++) {
          if (text[i]) {
            return_array.push(this.decrypt(text[i]));
          } else {
            return_array.push(text[i]);
          }
        }
        return return_array;
      } else {
        if (!text) return text;
        return this.decrypt(text as any);
      }
    } catch (e) {
      return text;
    }
  }

  decrypt(text: string) {
    try {
      if (text === undefined || text === null || text === '') return '';

      text = text.toString();

      const initVector = Buffer.from(this.encryptIv, 'utf-8');

      const SecurityKey = Buffer.from(this.encryptSecretKey, 'utf-8');

      const decipher = crypto.createDecipheriv(this.algorithm, SecurityKey, initVector);

      let decryptedData = decipher.update(text, 'hex', 'utf-8');

      decryptedData += decipher.final('utf8');

      return decryptedData;
    } catch (e) {
      return text;
    }
  }

  encryptObject<T extends Record<any, any>>(obj: T): T {
    return Object.keys(obj).reduce((acc, key) => {
      let nonEncryptedValue = obj[key] as any;

      if (typeof nonEncryptedValue === 'number') {
        nonEncryptedValue = nonEncryptedValue.toString();
      }

      const isValueObject =
        !Array.isArray(nonEncryptedValue) && typeof nonEncryptedValue === 'object' && nonEncryptedValue !== null;

      let encryptedValue: any;

      if (isValueObject) {
        encryptedValue = this.encryptObject(nonEncryptedValue);
      } else {
        encryptedValue = this.encryptText(nonEncryptedValue);
      }

      acc[key] = encryptedValue;

      return acc;
    }, {}) as T;
  }

  decryptObject<T extends Record<any, any>>(obj: T): T {
    return Object.keys(obj).reduce((acc, key) => {
      let encryptedValue = obj[key] as any;

      if (typeof encryptedValue === 'number') {
        encryptedValue = encryptedValue.toString();
      }

      const isValueObject = isObject(encryptedValue);

      let decryptedValue: any;

      if (isValueObject) {
        decryptedValue = this.decryptObject(encryptedValue);
      } else {
        decryptedValue = this.decryptText(encryptedValue);
      }

      acc[key] = decryptedValue || null;
      // try {
      //   acc[key] = this.decryptText(encryptedValue);
      // } catch (e) {
      //   acc[key] = encryptedValue || null;
      // }

      return acc;
    }, {}) as T;
  }
}
