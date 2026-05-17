import { validateForecastCombos, validateTricastCombos } from '../../common/validator/castValidator';

describe('validateForecastCombos', () => {
  it('accepts a non-dead-heat single-entry array', () => {
    const result = validateForecastCombos([{ selectionIds: ['a', 'b'], dividend: 13.56 }]);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('accepts the dead-heat shape from the Trello bug', () => {
    const result = validateForecastCombos([
      { selectionIds: ['4190425', '4216495'], dividend: 13.56 },
      { selectionIds: ['4190425', '4210872'], dividend: 22.35 },
    ]);
    expect(result.valid).toBe(true);
  });

  it('rejects an empty array', () => {
    const result = validateForecastCombos([]);
    expect(result.valid).toBe(false);
  });

  it('rejects wrong selectionIds length', () => {
    const result = validateForecastCombos([{ selectionIds: ['a', 'b', 'c'], dividend: 13.56 }]);
    expect(result.valid).toBe(false);
  });

  it('rejects non-positive dividend', () => {
    const result = validateForecastCombos([{ selectionIds: ['a', 'b'], dividend: 0 }]);
    expect(result.valid).toBe(false);
  });

  it('rejects duplicate rows', () => {
    const result = validateForecastCombos([
      { selectionIds: ['a', 'b'], dividend: 13.56 },
      { selectionIds: ['a', 'b'], dividend: 22.35 },
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/duplicate/);
  });

  it('rejects empty selection ids', () => {
    const result = validateForecastCombos([{ selectionIds: ['', 'b'], dividend: 13.56 }]);
    expect(result.valid).toBe(false);
  });
});

describe('validateTricastCombos', () => {
  it('accepts a 3-selection entry', () => {
    const result = validateTricastCombos([{ selectionIds: ['a', 'b', 'c'], dividend: 50 }]);
    expect(result.valid).toBe(true);
  });

  it('rejects a 2-selection entry', () => {
    const result = validateTricastCombos([{ selectionIds: ['a', 'b'], dividend: 50 }]);
    expect(result.valid).toBe(false);
  });
});
