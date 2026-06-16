import moment from 'moment';

import { checkIfEarlyPriceIsDisabledV2 } from '../../utils';
import { convertMysqlBoolean } from '../../utils';
import type { MysqlBoolean } from '../../types';

jest.mock('../../utils/convertMysqlBoolean', () => ({
  convertMysqlBoolean: jest.fn(),
}));

const mockedConvertMysqlBoolean = convertMysqlBoolean as jest.Mock;

describe('checkIfEarlyPriceIsDisabledV2', () => {
  // Frozen "now" = 2025-06-10 12:00 UTC. The sibling spec assumes a UTC test runner
  // for its time-of-day comparisons; this spec follows the same convention and uses
  // explicit `...Z` race dates so the date-aware cases stay timezone-independent.
  const baseTime = moment.utc('2025-06-10T12:00:00Z');

  const today = '2025-06-10T15:00:00Z';
  const tomorrow = '2025-06-11T14:00:00Z';

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(baseTime.toDate());
    // Early price shown by default; the disabled case overrides this.
    mockedConvertMysqlBoolean.mockReturnValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('returns true when early_price_show is off, regardless of the date/time', () => {
    mockedConvertMysqlBoolean.mockReturnValue(false);

    expect(
      checkIfEarlyPriceIsDisabledV2({
        raceCompetition: {
          early_price_show: 0 as MysqlBoolean,
          early_price_start_time: '08:00',
          early_price_start_date: 0,
        },
        raceStartTimeUtc: today,
      }),
    ).toBe(true);
  });

  describe('day-of racing (early_price_start_date = 0)', () => {
    it("returns true before the start time on the race's own day", () => {
      expect(
        checkIfEarlyPriceIsDisabledV2({
          raceCompetition: {
            early_price_show: 1 as MysqlBoolean,
            early_price_start_time: '13:00',
            early_price_start_date: 0,
          },
          raceStartTimeUtc: today,
        }),
      ).toBe(true);
    });

    it('returns false after the start time on the race day', () => {
      expect(
        checkIfEarlyPriceIsDisabledV2({
          raceCompetition: {
            early_price_show: 1 as MysqlBoolean,
            early_price_start_time: '08:00',
            early_price_start_date: 0,
          },
          raceStartTimeUtc: today,
        }),
      ).toBe(false);
    });

    it('returns true for a future-day race regardless of the clock (the bug being fixed)', () => {
      expect(
        checkIfEarlyPriceIsDisabledV2({
          raceCompetition: {
            early_price_show: 1 as MysqlBoolean,
            early_price_start_time: '08:00',
            early_price_start_date: 0,
          },
          raceStartTimeUtc: tomorrow,
        }),
      ).toBe(true);
    });
  });

  describe('day-before racing (early_price_start_date = 1)', () => {
    it('returns true before the start time on the day before the race', () => {
      expect(
        checkIfEarlyPriceIsDisabledV2({
          raceCompetition: {
            early_price_show: 1 as MysqlBoolean,
            early_price_start_time: '18:00',
            early_price_start_date: 1,
          },
          raceStartTimeUtc: tomorrow,
        }),
      ).toBe(true);
    });

    it('returns false after the start time on the day before the race', () => {
      expect(
        checkIfEarlyPriceIsDisabledV2({
          raceCompetition: {
            early_price_show: 1 as MysqlBoolean,
            early_price_start_time: '08:00',
            early_price_start_date: 1,
          },
          raceStartTimeUtc: tomorrow,
        }),
      ).toBe(false);
    });
  });

  it('uses the competition value over the global days-before fallback', () => {
    // Per-competition start_date = 1 opens the window the day before, so a tomorrow
    // race is already live now; the global value of 0 would have kept it as SP.
    expect(
      checkIfEarlyPriceIsDisabledV2({
        raceCompetition: {
          early_price_show: 1 as MysqlBoolean,
          early_price_start_time: '08:00',
          early_price_start_date: 1,
        },
        globalEarlyPriceStartDate: 0,
        raceStartTimeUtc: tomorrow,
      }),
    ).toBe(false);
  });

  it('falls back to the global time/date when the competition fields are null', () => {
    expect(
      checkIfEarlyPriceIsDisabledV2({
        raceCompetition: {
          early_price_show: 1 as MysqlBoolean,
          early_price_start_time: null,
          early_price_start_date: null,
        },
        globalEarlyPriceStartTime: '08:00',
        globalEarlyPriceStartDate: 0,
        raceStartTimeUtc: today,
      }),
    ).toBe(false);
  });

  it('uses the globals when there is no competition row (early price shown by default)', () => {
    expect(
      checkIfEarlyPriceIsDisabledV2({
        raceCompetition: null,
        globalEarlyPriceStartTime: '13:00',
        globalEarlyPriceStartDate: 0,
        raceStartTimeUtc: today,
      }),
    ).toBe(true);
  });

  describe('legacy fallback (no raceStartTimeUtc)', () => {
    it('returns true when now is before the start time today', () => {
      expect(
        checkIfEarlyPriceIsDisabledV2({
          raceCompetition: { early_price_show: 1 as MysqlBoolean, early_price_start_time: '13:00' },
        }),
      ).toBe(true);
    });

    it('returns false when now is after the start time today', () => {
      expect(
        checkIfEarlyPriceIsDisabledV2({
          raceCompetition: { early_price_show: 1 as MysqlBoolean, early_price_start_time: '11:00' },
        }),
      ).toBe(false);
    });
  });
});
