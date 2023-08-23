import Ajv from 'ajv';
import parsePhoneNumber from 'libphonenumber-js';
import ajvErrors from 'ajv-errors';

export class AjvValidator {
  private static ajvInstance: Ajv;

  private static instance: AjvValidator;

  static getInstance(): Ajv {
    if (!AjvValidator.instance) {
      AjvValidator.ajvInstance = new Ajv({
        allErrors: true,
      });

      AjvValidator.instance = new AjvValidator();

      ajvErrors(AjvValidator.ajvInstance);

      AjvValidator.instance.addKeyWords();
    }

    return AjvValidator.ajvInstance;
  }

  addKeyWords(): void {
    AjvValidator.ajvInstance.addKeyword({
      keyword: 'phoneNumber',
      validate: (_schema: Record<string, string>, data: any) => {
        if (typeof data !== 'string') {
          return false;
        }

        const phoneNumber = parsePhoneNumber(data);

        return phoneNumber ? phoneNumber.isValid() : false;
      },
    });

    AjvValidator.ajvInstance.addKeyword({
      keyword: 'numericString',
      validate: (_schema: Record<string, string>, data: any) => {
        if (typeof data !== 'string') {
          return false;
        }

        return Number.isInteger(+data);
      },
    });
  }
}
