import { parseLadderValue } from '../../utils';

describe('parseLadderValue', () => {
  it('should parse positive ladder values correctly', () => {
    expect(parseLadderValue('ladder+1')).toEqual({ ladder: 1, isNegative: false });
    expect(parseLadderValue('ladder+4')).toEqual({ ladder: 4, isNegative: false });
    expect(parseLadderValue('ladder+8')).toEqual({ ladder: 8, isNegative: false });
  });

  it('should parse negative ladder values correctly', () => {
    expect(parseLadderValue('ladder-8')).toEqual({ ladder: 8, isNegative: true });
    expect(parseLadderValue('ladder-7')).toEqual({ ladder: 7, isNegative: true });
  });
});
