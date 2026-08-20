import { getBetRadarEventStatus } from '../../../utils/events/getBetRadarEventStatus';
import { getBetRadarMatchStatusPhase } from '../../../common/constants/betRadarMatchStatus';
import { SportEventStatuses } from '../../../common';

describe('getBetRadarEventStatus', () => {
  describe('event-level status, on the post-migration UOF codes', () => {
    // These pairings are the half of the contract that unified-consumer-app's
    // scripts/migrate-event-status-to-uof.js REMAP defines. 2 and 3 in particular are the ones
    // that used to be swapped, and 3 carries ~78k prod rows, so they are pinned explicitly.
    it.each([
      ['0', SportEventStatuses.PRE_MATCH],
      ['1', SportEventStatuses.IN_PLAY],
      ['2', SportEventStatuses.SUSPENDED],
      ['3', SportEventStatuses.FINISHED],
      ['4', SportEventStatuses.CLOSED],
      ['5', SportEventStatuses.CANCELLED],
      ['6', SportEventStatuses.INTERRUPTED],
      ['7', SportEventStatuses.POSTPONED],
      ['8', SportEventStatuses.DELAYED],
      ['9', SportEventStatuses.ABANDONED],
      ['10', SportEventStatuses.RESCHEDULED],
    ])('maps status %s to %s', (eventStatusId, expected) => {
      expect(getBetRadarEventStatus({ eventStatusId }).current_status).toBe(expected);
    });

    it('falls back to pre_match for an unrecognised status rather than throwing', () => {
      expect(getBetRadarEventStatus({ eventStatusId: '99' })).toEqual({
        current_status: SportEventStatuses.PRE_MATCH,
        current_phase: 'Pre-Match',
      });
    });
  });

  describe('phase from match_status, for in-play events', () => {
    // Every expectation here was derived from prod period_scores data (11,748 events), where each
    // period_score entry pairs its `number` with the match_status_code current during it.
    it.each([
      ['tennis', '8', '1st Set'],
      ['tennis', '9', '2nd Set'],
      ['tennis', '10', '3rd Set'],
      ['soccer', '6', '1st Half'],
      ['soccer', '7', '2nd Half'],
      ['basketball', '13', '1st Quarter'],
      ['basketball', '16', '4th Quarter'],
      ['icehockey', '2', '2nd Period'],
      ['tabletennis', '12', '5th Set'],
    ])('%s match_status %s reads as %s', (sportSlug, matchStatus, expected) => {
      expect(getBetRadarEventStatus({ eventStatusId: '1', matchStatus, sportSlug })).toEqual({
        current_status: SportEventStatuses.IN_PLAY,
        current_phase: expected,
      });
    });

    it('accepts a numeric match_status as well as a string', () => {
      expect(getBetRadarEventStatus({ eventStatusId: '1', matchStatus: 9, sportSlug: 'tennis' }).current_phase).toBe(
        '2nd Set',
      );
    });
  });

  describe('falling back rather than inventing a label', () => {
    it('uses the status label when match_status is absent', () => {
      expect(getBetRadarEventStatus({ eventStatusId: '1' }).current_phase).toBe('In-Play');
    });

    it('uses the status label when sportSlug is missing, since the code is sport-specific', () => {
      expect(getBetRadarEventStatus({ eventStatusId: '1', matchStatus: '9' }).current_phase).toBe('In-Play');
    });

    it.each([
      ['soccer', '31'], // half-time
      ['soccer', '42'],
      ['tennis', '100'],
      ['icehockey', '301'], // overtime
      ['basketball', '302'], // penalties/shootout
      ['darts', '21'],
      ['baseball', '411'],
    ])('does not invent a label for the undecoded %s code %s', (sportSlug, matchStatus) => {
      expect(getBetRadarEventStatus({ eventStatusId: '1', matchStatus, sportSlug }).current_phase).toBe('In-Play');
    });

    it('ignores a period code for a sport we have no table for', () => {
      expect(getBetRadarEventStatus({ eventStatusId: '1', matchStatus: '6', sportSlug: 'cricket' }).current_phase).toBe(
        'In-Play',
      );
    });
  });

  describe('a period label must never outlive the period', () => {
    // The feed leaves the last match_status on the row after an event ends, so without the
    // in-play guard a finished match would keep reporting "2nd Half".
    it.each([
      ['3', SportEventStatuses.FINISHED, 'Finished'],
      ['2', SportEventStatuses.SUSPENDED, 'Suspended'],
      ['7', SportEventStatuses.POSTPONED, 'Postponed'],
      ['0', SportEventStatuses.PRE_MATCH, 'Pre-Match'],
    ])('status %s reports %s, not the stale period label', (eventStatusId, status, phase) => {
      expect(getBetRadarEventStatus({ eventStatusId, matchStatus: '7', sportSlug: 'soccer' })).toEqual({
        current_status: status,
        current_phase: phase,
      });
    });
  });
});

describe('getBetRadarMatchStatusPhase', () => {
  it('returns null — not a placeholder — for anything it cannot name', () => {
    expect(getBetRadarMatchStatusPhase('soccer', '31')).toBeNull();
    expect(getBetRadarMatchStatusPhase('cricket', '6')).toBeNull();
    expect(getBetRadarMatchStatusPhase(null, '6')).toBeNull();
    expect(getBetRadarMatchStatusPhase('soccer', null)).toBeNull();
    expect(getBetRadarMatchStatusPhase('soccer', '')).toBeNull();
    expect(getBetRadarMatchStatusPhase(undefined, undefined)).toBeNull();
  });

  it('resolves a known code', () => {
    expect(getBetRadarMatchStatusPhase('tennis', '9')).toBe('2nd Set');
  });
});
