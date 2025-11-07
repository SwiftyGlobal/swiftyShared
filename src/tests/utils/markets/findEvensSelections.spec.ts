import { findEvensSelections } from '../../../utils';
import type { OddsFormatsModel } from '../../../models';

type TestSelection = OddsFormatsModel & {
  bet_id: string;
  trading_status: string;
  outcome_type: string;
  participant_role_id: string;
  outcome_id: number;
  handicap: string;
  is_allowed: boolean;
  price_boost: boolean;
  is_manual: boolean;
  price_boost_odds: string | null;
  name: string;
  price_boost_type: string;
};

const buildSelectionsPayload = (): TestSelection[] => {
  const base: TestSelection[] = [
    {
      bet_id: 'e-286125349853477120-111',
      trading_status: 'open',
      outcome_type: 'draw',
      participant_role_id: '13',
      outcome_id: 13,
      handicap: '2.75',
      odds_decimal: '1.75',
      odds_american: '-133',
      odds_fractional: '3/4',
      is_allowed: true,
      price_boost: false,
      is_manual: false,
      price_boost_odds: null,
      name: 'Over 2.75',
      price_boost_type: 'standard',
    },
    {
      bet_id: 'e-286098146539353600-222',
      trading_status: 'open',
      outcome_type: 'draw',
      participant_role_id: '13',
      outcome_id: 13,
      handicap: '2.5',
      odds_decimal: '1.62',
      odds_american: '-163',
      odds_fractional: '8/13',
      is_allowed: true,
      price_boost: false,
      is_manual: false,
      price_boost_odds: null,
      name: 'Over 2.5',
      price_boost_type: 'standard',
    },
    {
      bet_id: 'e-286098146539352320-333',
      trading_status: 'open',
      outcome_type: 'draw',
      participant_role_id: '13',
      outcome_id: 13,
      handicap: '3',
      odds_decimal: '2.00',
      odds_american: '+100',
      odds_fractional: '1/1',
      is_allowed: true,
      price_boost: false,
      is_manual: false,
      price_boost_odds: null,
      name: 'Over 3',
      price_boost_type: 'standard',
    },
    {
      bet_id: 'e-286125349853475840-444',
      trading_status: 'open',
      outcome_type: 'draw',
      participant_role_id: '14',
      outcome_id: 14,
      handicap: '2.75',
      odds_decimal: '1.91',
      odds_american: '-110',
      odds_fractional: '10/11',
      is_allowed: true,
      price_boost: false,
      is_manual: false,
      price_boost_odds: null,
      name: 'Under 2.75',
      price_boost_type: 'standard',
    },
    {
      bet_id: 'e-286098146538306560-555',
      trading_status: 'open',
      outcome_type: 'draw',
      participant_role_id: '14',
      outcome_id: 14,
      handicap: '3',
      odds_decimal: '1.70',
      odds_american: '-143',
      odds_fractional: '7/10',
      is_allowed: true,
      price_boost: false,
      is_manual: false,
      price_boost_odds: null,
      name: 'Under 3',
      price_boost_type: 'standard',
    },
    {
      bet_id: 'e-286098146539354624-666',
      trading_status: 'open',
      outcome_type: 'draw',
      participant_role_id: '14',
      outcome_id: 14,
      handicap: '2.5',
      odds_decimal: '2.15',
      odds_american: '+115',
      odds_fractional: '23/20',
      is_allowed: true,
      price_boost: false,
      is_manual: false,
      price_boost_odds: null,
      name: 'Under 2.5',
      price_boost_type: 'standard',
    },
  ];

  return base;
};

describe('findEvensSelections', () => {
  it('returns the pair with the smallest odds gap (2.75 Over/Under)', () => {
    const allSelections: TestSelection[] = buildSelectionsPayload();

    const result = findEvensSelections(allSelections);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);

    const [first, second] = result;
    expect(first.handicap).toBe('2.75');
    expect(second.handicap).toBe('2.75');

    // Expect the names and decimal odds to match the expected evens pair
    expect([first.name, second.name].sort()).toEqual(['Over 2.75', 'Under 2.75'].sort());
    expect([first.odds_decimal, second.odds_decimal].sort()).toEqual(['1.75', '1.91'].sort());

    // Ensure randomized bet_ids exist and are strings
    expect(typeof first.bet_id).toBe('string');
    expect(typeof second.bet_id).toBe('string');
  });

  it('skips selections without a handicap (covers continue branch)', () => {
    const payload: TestSelection[] = [
      // Missing handicap -> should be skipped
      {
        bet_id: 'e-nh-001',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '13',
        outcome_id: 13,
        handicap: '',
        odds_decimal: '9.99',
        odds_american: '+999',
        odds_fractional: '999/1',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Irrelevant',
        price_boost_type: 'standard',
      },
      // Valid pairs for 2.75
      {
        bet_id: 'e-val-101',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '13',
        outcome_id: 13,
        handicap: '2.75',
        odds_decimal: '1.75',
        odds_american: '-133',
        odds_fractional: '3/4',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Over 2.75',
        price_boost_type: 'standard',
      },
      {
        bet_id: 'e-val-102',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '14',
        outcome_id: 14,
        handicap: '2.75',
        odds_decimal: '1.91',
        odds_american: '-110',
        odds_fractional: '10/11',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Under 2.75',
        price_boost_type: 'standard',
      },
    ];

    const result = findEvensSelections(payload);
    expect(result).toHaveLength(2);
    const [a, b] = result;
    expect([a.handicap, b.handicap]).toEqual(['2.75', '2.75']);
    expect([a.name, b.name].sort()).toEqual(['Over 2.75', 'Under 2.75'].sort());
  });

  it('returns an empty array when no valid opposing pair exists', () => {
    const noPair: TestSelection[] = [
      {
        bet_id: 'e-x-777',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '13',
        outcome_id: 13,
        handicap: '1.5',
        odds_decimal: '1.80',
        odds_american: '-125',
        odds_fractional: '4/5',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Over 1.5',
        price_boost_type: 'standard',
      },
      // Same handicap but same outcome_id -> not a valid opposing pair
      {
        bet_id: 'e-y-888',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '13',
        outcome_id: 13,
        handicap: '1.5',
        odds_decimal: '2.10',
        odds_american: '+110',
        odds_fractional: '11/10',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Under 1.5',
        price_boost_type: 'standard',
      },
    ];

    const result = findEvensSelections(noPair);
    expect(result).toEqual([]);
  });

  it('selects the valid line with the smallest odds gap among multiple candidates', () => {
    const payload: TestSelection[] = [
      // Line A (gap 0.10)
      {
        bet_id: 'a-1',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '13',
        outcome_id: 13,
        handicap: '2.0',
        odds_decimal: '2.10',
        odds_american: '+110',
        odds_fractional: '11/10',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Over 2.0',
        price_boost_type: 'standard',
      },
      {
        bet_id: 'a-2',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '14',
        outcome_id: 14,
        handicap: '2.0',
        odds_decimal: '2.00',
        odds_american: '+100',
        odds_fractional: '1/1',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Under 2.0',
        price_boost_type: 'standard',
      },

      // Line B (gap 0.05) -> should be chosen
      {
        bet_id: 'b-1',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '13',
        outcome_id: 13,
        handicap: '3.0',
        odds_decimal: '2.05',
        odds_american: '+105',
        odds_fractional: '21/20',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Over 3.0',
        price_boost_type: 'standard',
      },
      {
        bet_id: 'b-2',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '14',
        outcome_id: 14,
        handicap: '3.0',
        odds_decimal: '2.00',
        odds_american: '+100',
        odds_fractional: '1/1',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Under 3.0',
        price_boost_type: 'standard',
      },
    ];

    const result = findEvensSelections(payload);
    expect(result).toHaveLength(2);
    const [x, y] = result;
    expect(x.handicap).toBe('3.0');
    expect(y.handicap).toBe('3.0');
  });

  it('uses outcome identifiers when evensType is outcome', () => {
    const payload: TestSelection[] = [
      // Should be ignored for participant evens but valid for outcome evens
      {
        bet_id: 'o-1',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: 'shared',
        outcome_id: 200,
        handicap: '4.0',
        odds_decimal: '1.95',
        odds_american: '-105',
        odds_fractional: '20/21',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Over 4.0',
        price_boost_type: 'standard',
      },
      {
        bet_id: 'o-2',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: 'shared',
        outcome_id: 201,
        handicap: '4.0',
        odds_decimal: '1.88',
        odds_american: '-114',
        odds_fractional: '22/25',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Under 4.0',
        price_boost_type: 'standard',
      },
      // Valid for participant path but invalid for outcome path (same outcome_id)
      {
        bet_id: 'p-1',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: 'alpha',
        outcome_id: 300,
        handicap: '5.0',
        odds_decimal: '2.05',
        odds_american: '+105',
        odds_fractional: '21/20',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Over 5.0',
        price_boost_type: 'standard',
      },
      {
        bet_id: 'p-2',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: 'beta',
        outcome_id: 300,
        handicap: '5.0',
        odds_decimal: '1.90',
        odds_american: '-111',
        odds_fractional: '10/11',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Under 5.0',
        price_boost_type: 'standard',
      },
    ];

    const result = findEvensSelections(payload, 'outcome');
    expect(result).toHaveLength(2);
    const [first, second] = result;
    expect([first.handicap, second.handicap]).toEqual(['4.0', '4.0']);
    expect(new Set([first.outcome_id, second.outcome_id])).toEqual(new Set([200, 201]));
  });

  it('ignores pairs when participant identifiers are missing', () => {
    const payload: TestSelection[] = [
      {
        bet_id: 'm-1',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: undefined as unknown as string,
        outcome_id: 500,
        handicap: '6.0',
        odds_decimal: '1.80',
        odds_american: '-125',
        odds_fractional: '4/5',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Over 6.0',
        price_boost_type: 'standard',
      },
      {
        bet_id: 'm-2',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: 'role-b',
        outcome_id: 501,
        handicap: '6.0',
        odds_decimal: '2.10',
        odds_american: '+110',
        odds_fractional: '11/10',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Under 6.0',
        price_boost_type: 'standard',
      },
    ];

    expect(findEvensSelections(payload)).toEqual([]);
  });

  it('ignores pairs when outcome identifiers are undefined in outcome mode', () => {
    const payload: TestSelection[] = [
      {
        bet_id: 'u-undef-1',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: 'shared',
        outcome_id: undefined as unknown as number,
        handicap: '7.0',
        odds_decimal: '1.95',
        odds_american: '-105',
        odds_fractional: '20/21',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Over 7.0',
        price_boost_type: 'standard',
      },
      {
        bet_id: 'u-undef-2',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: 'shared',
        outcome_id: 601,
        handicap: '7.0',
        odds_decimal: '2.05',
        odds_american: '+105',
        odds_fractional: '21/20',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Under 7.0',
        price_boost_type: 'standard',
      },
    ];

    expect(findEvensSelections(payload, 'outcome')).toEqual([]);
  });

  it('ignores pairs when outcome identifiers are null in outcome mode', () => {
    const payload: TestSelection[] = [
      {
        bet_id: 'u-null-1',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: 'shared',
        outcome_id: null as unknown as number,
        handicap: '8.0',
        odds_decimal: '1.85',
        odds_american: '-118',
        odds_fractional: '17/20',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Over 8.0',
        price_boost_type: 'standard',
      },
      {
        bet_id: 'u-null-2',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: 'shared',
        outcome_id: 701,
        handicap: '8.0',
        odds_decimal: '2.15',
        odds_american: '+115',
        odds_fractional: '23/20',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Under 8.0',
        price_boost_type: 'standard',
      },
    ];

    expect(findEvensSelections(payload, 'outcome')).toEqual([]);
  });

  it('ignores lines with more than two selections (line length !== 2)', () => {
    const payload: TestSelection[] = [
      // Invalid line: length 3 -> ignored entirely
      {
        bet_id: 'c-1',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '13',
        outcome_id: 13,
        handicap: '1.0',
        odds_decimal: '1.90',
        odds_american: '-111',
        odds_fractional: '10/11',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Over 1.0',
        price_boost_type: 'standard',
      },
      {
        bet_id: 'c-2',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '14',
        outcome_id: 14,
        handicap: '1.0',
        odds_decimal: '2.00',
        odds_american: '+100',
        odds_fractional: '1/1',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Under 1.0',
        price_boost_type: 'standard',
      },
      {
        bet_id: 'c-3',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '15',
        outcome_id: 15,
        handicap: '1.0',
        odds_decimal: '1.95',
        odds_american: '-105',
        odds_fractional: '20/21',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Push 1.0',
        price_boost_type: 'standard',
      },

      // Valid line: should be chosen since the other is ignored
      {
        bet_id: 'd-1',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '13',
        outcome_id: 13,
        handicap: '2.0',
        odds_decimal: '1.80',
        odds_american: '-125',
        odds_fractional: '4/5',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Over 2.0',
        price_boost_type: 'standard',
      },
      {
        bet_id: 'd-2',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '14',
        outcome_id: 14,
        handicap: '2.0',
        odds_decimal: '2.00',
        odds_american: '+100',
        odds_fractional: '1/1',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Under 2.0',
        price_boost_type: 'standard',
      },
    ];

    const result = findEvensSelections(payload);
    expect(result).toHaveLength(2);
    const [x, y] = result;
    expect([x.handicap, y.handicap]).toEqual(['2.0', '2.0']);
  });

  it('breaks ties by first encountered handicap when odds gaps are equal', () => {
    const payload: TestSelection[] = [
      // First encountered handicap '2.0'
      {
        bet_id: 't-1',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '13',
        outcome_id: 13,
        handicap: '2.0',
        odds_decimal: '2.20',
        odds_american: '+120',
        odds_fractional: '6/5',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Over 2.0',
        price_boost_type: 'standard',
      },
      {
        bet_id: 't-2',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '14',
        outcome_id: 14,
        handicap: '2.0',
        odds_decimal: '2.00',
        odds_american: '+100',
        odds_fractional: '1/1',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Under 2.0',
        price_boost_type: 'standard',
      },
      // Second candidate handicap '3.0' with the same gap
      {
        bet_id: 't-3',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '13',
        outcome_id: 13,
        handicap: '3.0',
        odds_decimal: '1.90',
        odds_american: '-111',
        odds_fractional: '10/11',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Over 3.0',
        price_boost_type: 'standard',
      },
      {
        bet_id: 't-4',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '14',
        outcome_id: 14,
        handicap: '3.0',
        odds_decimal: '1.70',
        odds_american: '-143',
        odds_fractional: '7/10',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Under 3.0',
        price_boost_type: 'standard',
      },
    ];

    const result = findEvensSelections(payload);
    expect(result).toHaveLength(2);
    const [x, y] = result;
    expect(x.handicap).toBe('3.0');
    expect(y.handicap).toBe('3.0');
  });

  it('returns empty for empty input or only single selections per handicap', () => {
    expect(findEvensSelections([])).toEqual([]);

    const singlesOnly: TestSelection[] = [
      {
        bet_id: 's-1',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '13',
        outcome_id: 13,
        handicap: '2.0',
        odds_decimal: '1.80',
        odds_american: '-125',
        odds_fractional: '4/5',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Over 2.0',
        price_boost_type: 'standard',
      },
      {
        bet_id: 's-2',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '14',
        outcome_id: 14,
        handicap: '3.0',
        odds_decimal: '2.00',
        odds_american: '+100',
        odds_fractional: '1/1',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Under 3.0',
        price_boost_type: 'standard',
      },
    ];
    expect(findEvensSelections(singlesOnly)).toEqual([]);
  });

  it('ignores a two-item line when both selections have the same participant_role_id, but still picks a valid other line', () => {
    const payload: TestSelection[] = [
      // Invalid pair: same participant_role_id
      {
        bet_id: 'u-1',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '13',
        outcome_id: 13,
        handicap: '1.5',
        odds_decimal: '1.90',
        odds_american: '-111',
        odds_fractional: '10/11',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Over 1.5',
        price_boost_type: 'standard',
      },
      {
        bet_id: 'u-2',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '13',
        outcome_id: 13,
        handicap: '1.5',
        odds_decimal: '2.10',
        odds_american: '+110',
        odds_fractional: '11/10',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Under 1.5',
        price_boost_type: 'standard',
      },
      // Valid pair
      {
        bet_id: 'v-1',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '13',
        outcome_id: 13,
        handicap: '2.0',
        odds_decimal: '1.95',
        odds_american: '-105',
        odds_fractional: '20/21',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Over 2.0',
        price_boost_type: 'standard',
      },
      {
        bet_id: 'v-2',
        trading_status: 'open',
        outcome_type: 'draw',
        participant_role_id: '14',
        outcome_id: 14,
        handicap: '2.0',
        odds_decimal: '2.00',
        odds_american: '+100',
        odds_fractional: '1/1',
        is_allowed: true,
        price_boost: false,
        is_manual: false,
        price_boost_odds: null,
        name: 'Under 2.0',
        price_boost_type: 'standard',
      },
    ];

    const result = findEvensSelections(payload);
    expect(result).toHaveLength(2);
    const [x, y] = result;
    expect([x.handicap, y.handicap]).toEqual(['2.0', '2.0']);
  });
});
