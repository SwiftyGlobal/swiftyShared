import { CastResultType } from '../../common/constants/castResultType';

describe('CastResultType', () => {
  it('exposes the canonical per-combo result strings', () => {
    expect(CastResultType.NOT_APPLICABLE).toBe('not_applicable');
    expect(CastResultType.HIT).toBe('hit');
    expect(CastResultType.MISSED).toBe('missed');
    expect(CastResultType.VOID).toBe('void');
    expect(CastResultType.SINGLE).toBe('single');
    expect(CastResultType.FORECAST).toBe('forecast');
  });
});
