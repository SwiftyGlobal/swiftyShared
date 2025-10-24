import { generateUniqueNumber } from '../generateUniqueNumber';

describe('generateUniqueNumber', () => {
  it('should generate a positive 6-digit number', () => {
    const number = generateUniqueNumber();
    expect(number).toBeGreaterThanOrEqual(100000);
    expect(number).toBeLessThanOrEqual(999999);
  });

  it('should generate a negative 6-digit number when negative is true', () => {
    const number = generateUniqueNumber(true);
    expect(number).toBeLessThanOrEqual(-100000);
    expect(number).toBeGreaterThanOrEqual(-999999);
  });

  it('should generate different numbers on subsequent calls', () => {
    const number1 = generateUniqueNumber();
    const number2 = generateUniqueNumber();
    expect(number1).not.toEqual(number2);
  });
});
