import Decimal from 'decimal.js';

import { stripDecimal } from '../../utils';

describe('stripDecimal', () => {
  it('returns the number fixed to 5 decimals when there are 5 or fewer decimals', () => {
    expect(stripDecimal(1.12345)).toEqual(new Decimal(1.12345));
    expect(stripDecimal(1.1)).toEqual(new Decimal(1.1));
  });

  it('truncates and rounds correctly when there are exactly 6 decimals', () => {
    expect(stripDecimal(1.123456)).toEqual(new Decimal(1.12346));
    expect(stripDecimal(1.123454)).toEqual(new Decimal(1.12345));
  });

  it('truncates and rounds correctly when there are more than 6 decimals', () => {
    expect(stripDecimal(1.1234567)).toEqual(new Decimal(1.12346));
    expect(stripDecimal(1.1234564)).toEqual(new Decimal(1.12346));
    expect(stripDecimal(1.12345649)).toEqual(new Decimal(1.12346));
  });

  it('handles edge cases with trailing zeros correctly', () => {
    expect(stripDecimal(1.12345)).toEqual(new Decimal(1.12345));
    expect(stripDecimal(1.1)).toEqual(new Decimal(1.1));
  });

  it('handles very small numbers correctly', () => {
    expect(stripDecimal(0.000000123456)).toEqual(new Decimal(0.0));
    expect(stripDecimal(0.000001234567)).toEqual(new Decimal(0.0));
  });

  it('handles very large numbers correctly', () => {
    expect(stripDecimal(123456789.123456)).toEqual(new Decimal(123456789.12346));
    expect(stripDecimal(123456789.123454)).toEqual(new Decimal(123456789.12345));
  });
});
