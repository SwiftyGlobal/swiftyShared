import moment from 'moment';

import { checkIfEarlyPriceIsDisabled } from '../../utils';
import { convertMysqlBoolean } from '../../utils';
import type { MysqlBoolean, Nullable, RacingSportProviders } from '../../types';

jest.mock('../../utils/convertMysqlBoolean', () => ({
  convertMysqlBoolean: jest.fn(),
}));

const mockedConvertMysqlBoolean = convertMysqlBoolean as jest.Mock;

type RacingCompetitionEntry = {
  early_price_show: MysqlBoolean;
  early_price_start_time: Nullable<string>;
};

describe('checkIfEarlyPriceIsDisabled', () => {
  const provider: RacingSportProviders = 'c';
  const venueName = 'Ascot';
  const key = `${provider}-${venueName}`;

  const baseTime = moment.utc('2025-06-10T12:00:00Z');

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(baseTime.toDate());
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should return true if early_price_show is false (disabled)', () => {
    mockedConvertMysqlBoolean.mockReturnValue(false);

    const map = new Map<string, RacingCompetitionEntry>([
      [key, { early_price_show: 0 as MysqlBoolean, early_price_start_time: '13:00' }],
    ]);

    expect(checkIfEarlyPriceIsDisabled(map, venueName, provider)).toBe(true);
  });

  it('should return true if current time is before early_price_start_time', () => {
    mockedConvertMysqlBoolean.mockReturnValue(true);

    const map = new Map<string, RacingCompetitionEntry>([
      [key, { early_price_show: 1 as MysqlBoolean, early_price_start_time: '13:00' }],
    ]);

    expect(checkIfEarlyPriceIsDisabled(map, venueName, provider)).toBe(true);
  });

  it('should return false if early price is enabled and current time is after early_price_start_time', () => {
    mockedConvertMysqlBoolean.mockReturnValue(true);

    const map = new Map<string, RacingCompetitionEntry>([
      [key, { early_price_show: 1 as MysqlBoolean, early_price_start_time: '11:00' }],
    ]);

    expect(checkIfEarlyPriceIsDisabled(map, venueName, provider)).toBe(false);
  });

  it('should return false if venue-provider key is not found in the map', () => {
    mockedConvertMysqlBoolean.mockReturnValue(true);

    const map = new Map<string, RacingCompetitionEntry>();

    expect(checkIfEarlyPriceIsDisabled(map, venueName, provider)).toBe(false);
  });

  it('should return false if early_price_start_time is null (invalid)', () => {
    mockedConvertMysqlBoolean.mockReturnValue(true);

    const map = new Map<string, RacingCompetitionEntry>([
      [key, { early_price_show: 1 as MysqlBoolean, early_price_start_time: null }],
    ]);

    expect(checkIfEarlyPriceIsDisabled(map, venueName, provider)).toBe(false);
  });
});
