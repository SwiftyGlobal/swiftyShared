import { numberFormatter } from '../../utils/numberFormatter';

describe('numberFormatter', () => {
  it('should format number with two decimal places', () => {
    expect(numberFormatter(1234.5)).toBe('1,234.50');
    expect(numberFormatter(0)).toBe('0.00');
    expect(numberFormatter(1000)).toBe('1,000.00');
    expect(numberFormatter(1234.5678)).toBe('1,234.57');
    expect(numberFormatter(12.34)).toBe('12.34');
    expect(numberFormatter(12.3)).toBe('12.30');
  });

  it('should handle integer numbers correctly', () => {
    expect(numberFormatter(5)).toBe('5.00');
    expect(numberFormatter(1000000)).toBe('1,000,000.00');
  });

  it('should handle numbers without decimals', () => {
    expect(numberFormatter(7)).toBe('7.00');
  });
});
