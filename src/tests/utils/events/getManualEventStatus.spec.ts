import { getManualEventPhaseStatus } from '../../../utils';
import { SportEventStatuses } from '../../../common';

describe('getManualEventPhaseStatus', () => {
  it('should return IN_PLAY status when eventPhase is "InPlay"', () => {
    const result = getManualEventPhaseStatus({ eventPhase: 'InPlay' });
    expect(result.current_status).toBe(SportEventStatuses.IN_PLAY);
    expect(result.current_phase).toBe('InPlay');
  });

  it('should return PRE_MATCH status when eventPhase is "PreMatch"', () => {
    const result = getManualEventPhaseStatus({ eventPhase: 'PreMatch' });
    expect(result.current_status).toBe(SportEventStatuses.PRE_MATCH);
    expect(result.current_phase).toBe('PreMatch');
  });

  it('should return PRE_MATCH status when eventPhase is "Pre-Match"', () => {
    const result = getManualEventPhaseStatus({ eventPhase: 'Pre-Match' });
    expect(result.current_status).toBe(SportEventStatuses.PRE_MATCH);
    expect(result.current_phase).toBe('Pre-Match');
  });

  it('should return PRE_MATCH status by default for unknown eventPhase', () => {
    const result = getManualEventPhaseStatus({ eventPhase: 'UnknownPhase' });
    expect(result.current_status).toBe(SportEventStatuses.PRE_MATCH);
    expect(result.current_phase).toBe('UnknownPhase');
  });
});
