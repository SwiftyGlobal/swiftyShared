import { BoostType } from '../../common/constants/boostType';

describe('BoostType', () => {
  it('exposes the canonical tag strings', () => {
    expect(BoostType.ACCA).toBe('ACCA_BOOST');
    expect(BoostType.BB).toBe('BB_BOOST');
    expect(BoostType.LUCKY).toBe('LUCKY_BOOST');
    expect(BoostType.BOG).toBe('BOG');
  });
});
