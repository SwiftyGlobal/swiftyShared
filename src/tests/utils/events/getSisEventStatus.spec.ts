import { getSISEventStatus } from '../../../utils';
import { SportEventStatuses } from '../../../common';

describe('getSISEventStatus', () => {
  it('should return FINISHED if isEventResulted is true', () => {
    expect(getSISEventStatus(null, true)).toBe(SportEventStatuses.FINISHED);
    expect(getSISEventStatus('2025-06-10T12:00:00Z', true)).toBe(SportEventStatuses.FINISHED);
  });

  it('should return IN_PLAY if offTime is defined and isEventResulted is false', () => {
    expect(getSISEventStatus('2025-06-10T12:00:00Z', false)).toBe(SportEventStatuses.IN_PLAY);
  });

  it('should return PRE_MATCH if offTime is null and isEventResulted is false', () => {
    expect(getSISEventStatus(null, false)).toBe(SportEventStatuses.PRE_MATCH);
  });
});
