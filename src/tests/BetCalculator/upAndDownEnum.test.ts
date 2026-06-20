import { BetSlipType, BetSlipTypeName } from '../../common/constants/betSlipType';

describe('Up-and-Down bet-type vocabulary', () => {
  it('exposes the two slugs with bet_slip_place_<slug> values', () => {
    expect(BetSlipType.UP_AND_DOWN_SSA).toBe('bet_slip_place_up_and_down_ssa');
    expect(BetSlipType.UP_AND_DOWN_DSA).toBe('bet_slip_place_up_and_down_dsa');
  });

  it('exposes display names', () => {
    expect(BetSlipTypeName[BetSlipType.UP_AND_DOWN_SSA]).toBe('Up and Down SSA');
    expect(BetSlipTypeName[BetSlipType.UP_AND_DOWN_DSA]).toBe('Up and Down DSA');
  });
});
