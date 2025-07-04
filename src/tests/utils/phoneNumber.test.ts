import { validateAndNormalizePhoneNumber } from '../../utils';

describe('validateAndNormalizePhoneNumber', () => {
  it('should validate and normalize a valid UK phone number', () => {
    const result = validateAndNormalizePhoneNumber('07123456789', '44');
    expect(result).toBe('7123456789');
  });

  it('should validate and normalize a valid IE phone number', () => {
    const result = validateAndNormalizePhoneNumber('0831234567', '353');
    expect(result).toBe('831234567');
  });

  it('should validate and normalize a valid ZA phone number', () => {
    const result = validateAndNormalizePhoneNumber('0712345678', '27');
    expect(result).toBe('712345678');
  });

  it('should throw an error for an invalid UK phone number', () => {
    expect(() => validateAndNormalizePhoneNumber('08123456789', '44')).toThrow('Invalid phone number format');
  });

  it('should throw an error for an invalid IE phone number', () => {
    expect(() => validateAndNormalizePhoneNumber('0912345678', '353')).toThrow('Invalid phone number format');
  });

  it('should throw an error for an invalid ZA phone number', () => {
    expect(() => validateAndNormalizePhoneNumber('0812345678', '27')).toThrow('Invalid phone number format');
  });

  it('should return the phone number without leading zero if no prefix is provided', () => {
    const result = validateAndNormalizePhoneNumber('07123456789', '');
    expect(result).toBe('7123456789');
  });

  it('should throw an error if prefix is provided but not supported', () => {
    expect(() => validateAndNormalizePhoneNumber('07123456789', '27')).toThrow('Invalid phone number format');
  });
});
