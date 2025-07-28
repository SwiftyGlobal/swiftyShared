import { formatOnlyDigits, stripLeadingZero, validateAndNormalizePhoneNumber } from '../../utils';

describe('formatOnlyDigits', () => {
  it('returns only digits from a string with mixed characters', () => {
    expect(formatOnlyDigits('abc123-456.7890')).toBe('1234567890');
  });

  it('returns empty string when input is empty', () => {
    expect(formatOnlyDigits('')).toBe('');
  });

  it('returns empty string when input has no digits', () => {
    expect(formatOnlyDigits('abc-xyz')).toBe('');
  });

  it('returns the same string if input is already only digits', () => {
    expect(formatOnlyDigits('123456')).toBe('123456');
  });
});

describe('stripLeadingZero', () => {
  it('removes a single leading zero from the string', () => {
    expect(stripLeadingZero('012345')).toBe('12345');
  });

  it('does not remove zero if it is not leading', () => {
    expect(stripLeadingZero('120345')).toBe('120345');
  });

  it('returns the same string if there is no leading zero', () => {
    expect(stripLeadingZero('12345')).toBe('12345');
  });

  it('removes only the first leading zero if multiple zeros', () => {
    expect(stripLeadingZero('0012345')).toBe('012345');
  });

  it('returns empty string if input is a single zero', () => {
    expect(stripLeadingZero('0')).toBe('');
  });

  it('returns empty string if input is empty', () => {
    expect(stripLeadingZero('')).toBe('');
  });
});

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
    const result = validateAndNormalizePhoneNumber('0612345678', '27');
    expect(result).toBe('612345678');
  });

  it('should validate and normalize a valid ZA phone number', () => {
    const result = validateAndNormalizePhoneNumber('0712345678', '27');
    expect(result).toBe('712345678');
  });

  it('should validate and normalize a valid ZA phone number', () => {
    const result = validateAndNormalizePhoneNumber('0812345678', '27');
    expect(result).toBe('812345678');
  });

  it('should throw an error for an invalid UK phone number', () => {
    expect(() => validateAndNormalizePhoneNumber('08123456789', '44')).toThrow('Invalid phone number format');
  });

  it('should throw an error for an invalid IE phone number', () => {
    expect(() => validateAndNormalizePhoneNumber('0912345678', '353')).toThrow('Invalid phone number format');
  });

  it('should throw an error for an invalid ZA phone number', () => {
    expect(() => validateAndNormalizePhoneNumber('0912345678', '27')).toThrow('Invalid phone number format');
  });

  it('should return the phone number without leading zero if no prefix is provided', () => {
    const result = validateAndNormalizePhoneNumber('07123456789', '');
    expect(result).toBe('7123456789');
  });

  it('should throw an error if prefix is provided but not supported', () => {
    expect(() => validateAndNormalizePhoneNumber('07123456789', '27')).toThrow('Invalid phone number format');
  });
});
