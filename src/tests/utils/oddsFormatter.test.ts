import { decimalToFractionalV2 } from '../../utils/oddsFormatter';

describe('decimalToFractionalV2', () => {
  describe('exact matches', () => {
    it('returns exact match for 1.001', () => {
      const result = decimalToFractionalV2(1.001);
      expect(result.decimal).toBe('1.001');
      expect(result.fractional).toBe('1/1000');
    });

    it('returns exact match for 1.5', () => {
      const result = decimalToFractionalV2(1.5);
      expect(result.decimal).toBe('1.5');
      expect(result.fractional).toBe('1/2');
    });

    it('returns exact match for 2.0', () => {
      const result = decimalToFractionalV2(2.0);
      expect(result.decimal).toBe('2');
      expect(result.fractional).toBe('1/1');
    });

    it('returns exact match for 3.0', () => {
      const result = decimalToFractionalV2(3.0);
      expect(result.decimal).toBe('3');
      expect(result.fractional).toBe('2/1');
    });

    it('returns exact match for 10.0', () => {
      const result = decimalToFractionalV2(10.0);
      expect(result.decimal).toBe('10');
      expect(result.fractional).toBe('9/1');
    });

    it('returns exact match for 1001.0', () => {
      const result = decimalToFractionalV2(1001.0);
      expect(result.decimal).toBe('1001');
      expect(result.fractional).toBe('1000/1');
    });

    it('returns exact match for 5001.0', () => {
      const result = decimalToFractionalV2(5001.0);
      expect(result.decimal).toBe('5001');
      expect(result.fractional).toBe('5000/1');
    });

    it('handles decimal precision correctly for 1.0025', () => {
      const result = decimalToFractionalV2(1.0025);
      expect(result.decimal).toBe('1.0025');
      expect(result.fractional).toBe('1/400');
    });

    it('handles decimal precision correctly for 1.00333', () => {
      const result = decimalToFractionalV2(1.00333);
      expect(result.decimal).toBe('1.00333');
      expect(result.fractional).toBe('1/300');
    });

    it('rounds to 5 decimal places for floating point precision', () => {
      const result = decimalToFractionalV2(1.001000001);
      expect(result.decimal).toBe('1.001');
      expect(result.fractional).toBe('1/1000');
    });

    it('returns exact match for 1.01', () => {
      const result = decimalToFractionalV2(1.01);
      expect(result.decimal).toBe('1.01');
      expect(result.fractional).toBe('1/100');
    });

    it('returns exact match for 1.02', () => {
      const result = decimalToFractionalV2(1.02);
      expect(result.decimal).toBe('1.02');
      expect(result.fractional).toBe('1/50');
    });

    it('returns exact match for 1.125', () => {
      const result = decimalToFractionalV2(1.125);
      expect(result.decimal).toBe('1.125');
      expect(result.fractional).toBe('1/8');
    });
  });

  describe('values less than first key (1.001)', () => {
    it('returns first key when value is less than 1.001', () => {
      const result = decimalToFractionalV2(1.0005);
      expect(result.decimal).toBe('1.001');
      expect(result.fractional).toBe('1/1000');
    });

    it('returns first key when value is 1.0', () => {
      const result = decimalToFractionalV2(1.0);
      expect(result.decimal).toBe('1.001');
      expect(result.fractional).toBe('1/1000');
    });

    it('returns first key when value is 0.5', () => {
      const result = decimalToFractionalV2(0.5);
      expect(result.decimal).toBe('1.001');
      expect(result.fractional).toBe('1/1000');
    });
  });

  describe('values between keys', () => {
    it('returns next key for value between 1.001 and 1.00133 (matches Java behavior)', () => {
      const result = decimalToFractionalV2(1.0012);
      expect(result.decimal).toBe('1.00133');
      expect(result.fractional).toBe('1/750');
    });

    it('returns next key for value between 1.002 and 1.0025 (matches Java behavior)', () => {
      const result = decimalToFractionalV2(1.0023);
      expect(result.decimal).toBe('1.0025');
      expect(result.fractional).toBe('1/400');
    });

    it('returns next key for value between 1.5 and 1.53333 (matches Java behavior)', () => {
      const result = decimalToFractionalV2(1.52);
      expect(result.decimal).toBe('1.53333');
      expect(result.fractional).toBe('8/15');
    });

    it('returns next key for value between 2.0 and 2.05 (matches Java behavior)', () => {
      const result = decimalToFractionalV2(2.02);
      expect(result.decimal).toBe('2.05');
      expect(result.fractional).toBe('21/20');
    });

    it('returns next key for value between 3.5 and 3.6 (matches Java behavior)', () => {
      const result = decimalToFractionalV2(3.55);
      expect(result.decimal).toBe('3.6');
      expect(result.fractional).toBe('13/5');
    });

    it('returns next key for value between 10.0 and 11.0 (matches Java behavior)', () => {
      const result = decimalToFractionalV2(10.5);
      expect(result.decimal).toBe('11');
      expect(result.fractional).toBe('10/1');
    });

    it('returns next key for value 5000 between 3501 and 5001 (matches Java behavior)', () => {
      const result = decimalToFractionalV2(5000);
      expect(result.decimal).toBe('5001');
      expect(result.fractional).toBe('5000/1');
    });

    it('covers i !== 0 branch for value between 1.04 and 1.05', () => {
      const result = decimalToFractionalV2(1.042);
      expect(result.decimal).toBe('1.05');
      expect(result.fractional).toBe('1/20');
    });

    it('covers i !== 0 branch for value between 1.2 and 1.22222', () => {
      const result = decimalToFractionalV2(1.21);
      expect(result.decimal).toBe('1.22222');
      expect(result.fractional).toBe('2/9');
    });

    it('covers i !== 0 branch for value between 2.5 and 2.6', () => {
      const result = decimalToFractionalV2(2.55);
      expect(result.decimal).toBe('2.6');
      expect(result.fractional).toBe('8/5');
    });

    it('covers i !== 0 branch for value between 4.5 and 4.6', () => {
      const result = decimalToFractionalV2(4.55);
      expect(result.decimal).toBe('4.6');
      expect(result.fractional).toBe('18/5');
    });

    it('covers i !== 0 branch for value between 100 and 101', () => {
      const result = decimalToFractionalV2(100.5);
      expect(result.decimal).toBe('101');
      expect(result.fractional).toBe('100/1');
    });

    it('covers i !== 0 branch for value between 500 and 501', () => {
      const result = decimalToFractionalV2(500.5);
      expect(result.decimal).toBe('501');
      expect(result.fractional).toBe('500/1');
    });
  });

  describe('values greater than last key (5001)', () => {
    it('returns default when value is greater than 5001', () => {
      const result = decimalToFractionalV2(6000);
      expect(result.decimal).toBe('1');
      expect(result.fractional).toBe('0/1');
    });

    it('returns default when value is much greater than 5001', () => {
      const result = decimalToFractionalV2(10000);
      expect(result.decimal).toBe('1');
      expect(result.fractional).toBe('0/1');
    });

    it('handles value just above 5001 after rounding', () => {
      // 5001.00001 rounds to 5001.00001 (5 decimals), which is > 5001, so it should return default
      const result = decimalToFractionalV2(5001.00001);
      expect(result.decimal).toBe('1');
      expect(result.fractional).toBe('0/1');
    });
  });

  describe('edge cases', () => {
    it('handles common betting odds like 1.8', () => {
      const result = decimalToFractionalV2(1.8);
      expect(result.decimal).toBe('1.8');
      expect(result.fractional).toBe('4/5');
    });

    it('handles common betting odds like 2.5', () => {
      const result = decimalToFractionalV2(2.5);
      expect(result.decimal).toBe('2.5');
      expect(result.fractional).toBe('6/4');
    });

    it('handles common betting odds like 5.0', () => {
      const result = decimalToFractionalV2(5.0);
      expect(result.decimal).toBe('5');
      expect(result.fractional).toBe('4/1');
    });

    it('handles values just above exact matches (rounds up to next key)', () => {
      const result = decimalToFractionalV2(1.5001);
      expect(result.decimal).toBe('1.53333');
      expect(result.fractional).toBe('8/15');
    });

    it('handles values just below the next key (rounds up to next key)', () => {
      const result = decimalToFractionalV2(1.53332);
      expect(result.decimal).toBe('1.53333');
      expect(result.fractional).toBe('8/15');
    });
  });

  describe('basic cases', () => {
    it('handles 1.1', () => {
      const result = decimalToFractionalV2(1.1);
      expect(result.decimal).toBe('1.1');
      expect(result.fractional).toBe('1/10');
    });

    it('handles 1.25', () => {
      const result = decimalToFractionalV2(1.25);
      expect(result.decimal).toBe('1.25');
      expect(result.fractional).toBe('1/4');
    });

    it('handles 1.75', () => {
      const result = decimalToFractionalV2(1.75);
      expect(result.decimal).toBe('1.75');
      expect(result.fractional).toBe('3/4');
    });

    it('handles 4.0', () => {
      const result = decimalToFractionalV2(4.0);
      expect(result.decimal).toBe('4');
      expect(result.fractional).toBe('3/1');
    });

    it('handles 6.0', () => {
      const result = decimalToFractionalV2(6.0);
      expect(result.decimal).toBe('6');
      expect(result.fractional).toBe('5/1');
    });

    it('handles 7.0', () => {
      const result = decimalToFractionalV2(7.0);
      expect(result.decimal).toBe('7');
      expect(result.fractional).toBe('6/1');
    });

    it('handles 8.0', () => {
      const result = decimalToFractionalV2(8.0);
      expect(result.decimal).toBe('8');
      expect(result.fractional).toBe('7/1');
    });

    it('handles 11.0', () => {
      const result = decimalToFractionalV2(11.0);
      expect(result.decimal).toBe('11');
      expect(result.fractional).toBe('10/1');
    });

    it('handles 12.0', () => {
      const result = decimalToFractionalV2(12.0);
      expect(result.decimal).toBe('12');
      expect(result.fractional).toBe('11/1');
    });

    it('handles 15.0', () => {
      const result = decimalToFractionalV2(15.0);
      expect(result.decimal).toBe('15');
      expect(result.fractional).toBe('14/1');
    });

    it('handles 20.0', () => {
      const result = decimalToFractionalV2(20.0);
      expect(result.decimal).toBe('21');
      expect(result.fractional).toBe('20/1');
    });

    it('handles 2.2', () => {
      const result = decimalToFractionalV2(2.2);
      expect(result.decimal).toBe('2.2');
      expect(result.fractional).toBe('6/5');
    });

    it('handles 2.75', () => {
      const result = decimalToFractionalV2(2.75);
      expect(result.decimal).toBe('2.75');
      expect(result.fractional).toBe('7/4');
    });

    it('handles 3.5', () => {
      const result = decimalToFractionalV2(3.5);
      expect(result.decimal).toBe('3.5');
      expect(result.fractional).toBe('5/2');
    });
  });

  describe('return value structure', () => {
    it('always returns an object with decimal and fractional properties', () => {
      const result = decimalToFractionalV2(2.0);
      expect(result).toHaveProperty('decimal');
      expect(result).toHaveProperty('fractional');
      expect(typeof result.decimal).toBe('string');
      expect(typeof result.fractional).toBe('string');
    });

    it('decimal is always a string representation of the decimal odds', () => {
      const result = decimalToFractionalV2(1.5);
      expect(result.decimal).toBe('1.5');
    });

    it('fractional is always a string in "X/Y" format', () => {
      const result = decimalToFractionalV2(2.0);
      expect(result.fractional).toMatch(/^\d+\/\d+$/);
    });
  });

  describe('comprehensive test across key ranges', () => {
    const testCases = [
      { input: 1.001, expectedDecimal: '1.001', expectedFractional: '1/1000' },
      { input: 1.01, expectedDecimal: '1.01', expectedFractional: '1/100' },
      { input: 1.1, expectedDecimal: '1.1', expectedFractional: '1/10' },
      { input: 1.25, expectedDecimal: '1.25', expectedFractional: '1/4' },
      { input: 1.5, expectedDecimal: '1.5', expectedFractional: '1/2' },
      { input: 2, expectedDecimal: '2', expectedFractional: '1/1' },
      { input: 3, expectedDecimal: '3', expectedFractional: '2/1' },
      { input: 5, expectedDecimal: '5', expectedFractional: '4/1' },
      { input: 10, expectedDecimal: '10', expectedFractional: '9/1' },
      { input: 100, expectedDecimal: '101', expectedFractional: '100/1' },
      { input: 500, expectedDecimal: '501', expectedFractional: '500/1' },
      { input: 1000, expectedDecimal: '1001', expectedFractional: '1000/1' },
      { input: 5000, expectedDecimal: '5001', expectedFractional: '5000/1' },
    ];

    testCases.forEach(({ input, expectedDecimal, expectedFractional }) => {
      it(`correctly handles input ${input}`, () => {
        const result = decimalToFractionalV2(input);
        expect(result.decimal).toBe(expectedDecimal);
        expect(result.fractional).toBe(expectedFractional);
      });
    });
  });
});
