import { getLadderBoostedPriceV3, getLadderBoostedPriceV4 } from '../../utils';
import type { LadderModel } from '../../models';
import type { LaddersMap } from '../../types';
import { PriceBoostTypes } from '../../common';

describe('getLadderBoostedPriceV3', () => {
  const ladders: LadderModel[] = [
    {
      id: 1,
      in_decimal: '1.1',
      pairing_decimal: 1,
      in_fraction: '1/10',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
    {
      id: 1,
      in_decimal: '1.33333',
      pairing_decimal: 1,
      in_fraction: '1/3',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
    {
      id: 1,
      in_decimal: '2',
      pairing_decimal: 1,
      in_fraction: '1/1',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
    {
      id: 1,
      in_decimal: '3',
      pairing_decimal: 1,
      in_fraction: '2/1',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
    {
      id: 1,
      in_decimal: '4',
      pairing_decimal: 1,
      in_fraction: '3/1',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
    {
      id: 1,
      in_decimal: '5',
      pairing_decimal: 1,
      in_fraction: '4/1',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
    {
      id: 1,
      in_decimal: '6',
      pairing_decimal: 1,
      in_fraction: '5/1',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
  ];

  const laddersMap: LaddersMap = new Map([['soccer', ladders]]);

  it('returns 0 and standard boost type when decimal is not available or ladder is -1', () => {
    expect(
      getLadderBoostedPriceV3({ sportSlug: 'soccer', decimal: 0, ladderValue: 'ladder+1', laddersMap: new Map() }),
    ).toEqual({ decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD });

    expect(
      getLadderBoostedPriceV3({ sportSlug: 'soccer', decimal: 1.5, ladderValue: '-1', laddersMap: new Map() }),
    ).toEqual({ decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD });
  });

  it('returns 0 and standard boost type if no ladders are found', () => {
    expect(
      getLadderBoostedPriceV3({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder+1', laddersMap: new Map() }),
    ).toEqual({ decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD });
  });

  it('returns the boosted price and boost type based on the ladder and decimal', () => {
    expect(getLadderBoostedPriceV3({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder+1', laddersMap })).toEqual(
      { decimal: 2, fractional: '1/1', price_boost_type: PriceBoostTypes.BOOST },
    );

    expect(getLadderBoostedPriceV3({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder+4', laddersMap })).toEqual(
      { decimal: 5, fractional: '4/1', price_boost_type: PriceBoostTypes.SUPER_BOOST },
    );
  });

  it('returns the correct boosted price and boost type for negative ladders', () => {
    expect(getLadderBoostedPriceV3({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder-1', laddersMap })).toEqual(
      { decimal: 1.33333, fractional: '1/3', price_boost_type: PriceBoostTypes.STANDARD },
    );
  });

  it('returns the correct boosted price and boost type when ladders are less than requested', () => {
    expect(getLadderBoostedPriceV3({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder-8', laddersMap })).toEqual(
      { decimal: 1.1, fractional: '1/10', price_boost_type: PriceBoostTypes.STANDARD },
    );
  });

  it('returns fallback boosted price and boost type when ladders are not available for any reason', () => {
    // Put wrong sport slug for the ladders to test if it falls back to the standard boost
    expect(
      getLadderBoostedPriceV3({ sportSlug: 'socccer', decimal: 1.5, ladderValue: 'ladder+8', laddersMap }),
    ).toEqual({ decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD });
  });

  it('returns 0 and STANDARD boost type when foundLadders is empty', () => {
    const laddersMapWithLowOdds = new Map<string, LadderModel[]>([
      [
        'soccer',
        [{ id: 1, in_decimal: '1.1', pairing_decimal: 1, in_fraction: '', pairing_fraction: 1, sport_slug: 'soccer' }],
      ],
    ]);

    expect(
      getLadderBoostedPriceV3({
        sportSlug: 'soccer',
        decimal: 5.0,
        ladderValue: 'ladder+1',
        laddersMap: laddersMapWithLowOdds,
      }),
    ).toEqual({ decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD });
  });

  it('returns correct price and boost type when decimal float part is more than 5 items', () => {
    expect(
      getLadderBoostedPriceV3({
        sportSlug: 'soccer',
        // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
        decimal: 1.33333333333333333333333333333333333333,
        ladderValue: 'ladder+1',
        laddersMap,
      }),
    ).toEqual({ decimal: 2, fractional: '1/1', price_boost_type: PriceBoostTypes.BOOST });

    expect(
      getLadderBoostedPriceV3({
        sportSlug: 'soccer',
        // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
        decimal: 1.33333333333333333333333333333333333333,
        ladderValue: 'ladder-1',
        laddersMap,
      }),
    ).toEqual({ decimal: 1.1, fractional: '1/10', price_boost_type: PriceBoostTypes.STANDARD });

    expect(
      getLadderBoostedPriceV3({
        sportSlug: 'soccer',
        decimal: 1.44444444,
        ladderValue: 'ladder+1',
        laddersMap,
      }),
    ).toEqual({ decimal: 2, fractional: '1/1', price_boost_type: PriceBoostTypes.BOOST });
  });
});

describe('getLadderBoostedPriceV4', () => {
  const ladders: LadderModel[] = [
    {
      id: 1,
      in_decimal: '1.1',
      pairing_decimal: 1,
      in_fraction: '1/10',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
    {
      id: 2,
      in_decimal: '1.33333',
      pairing_decimal: 1,
      in_fraction: '1/3',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
    {
      id: 3,
      in_decimal: '2',
      pairing_decimal: 1,
      in_fraction: '1/1',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
    {
      id: 4,
      in_decimal: '3',
      pairing_decimal: 1,
      in_fraction: '2/1',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
    {
      id: 5,
      in_decimal: '4',
      pairing_decimal: 1,
      in_fraction: '3/1',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
    {
      id: 6,
      in_decimal: '5',
      pairing_decimal: 1,
      in_fraction: '4/1',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
    {
      id: 7,
      in_decimal: '6',
      pairing_decimal: 1,
      in_fraction: '5/1',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
  ];

  const laddersMap: LaddersMap = new Map([['soccer', ladders]]);

  describe('Basic validation', () => {
    it('returns 0 and standard boost type when decimal is not available', () => {
      expect(
        getLadderBoostedPriceV4({ sportSlug: 'soccer', decimal: 0, ladderValue: 'ladder+1', laddersMap: new Map() }),
      ).toEqual({ decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD });
    });

    it('returns 0 and standard boost type when ladder is -1', () => {
      expect(
        getLadderBoostedPriceV4({ sportSlug: 'soccer', decimal: 1.5, ladderValue: '-1', laddersMap: new Map() }),
      ).toEqual({ decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD });
    });

    it('returns 0 and standard boost type if no ladders are found', () => {
      expect(
        getLadderBoostedPriceV4({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder+1', laddersMap: new Map() }),
      ).toEqual({ decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD });
    });
  });

  describe('Positive ladders (ladder+X)', () => {
    it('returns the boosted price with BOOST type for ladder+1', () => {
      expect(
        getLadderBoostedPriceV4({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder+1', laddersMap }),
      ).toEqual({ decimal: 2, fractional: '1/1', price_boost_type: PriceBoostTypes.BOOST });
    });

    it('returns the boosted price with BOOST type for ladder+2', () => {
      expect(
        getLadderBoostedPriceV4({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder+2', laddersMap }),
      ).toEqual({ decimal: 3, fractional: '2/1', price_boost_type: PriceBoostTypes.BOOST });
    });

    it('returns the boosted price with BOOST type for ladder+3', () => {
      expect(
        getLadderBoostedPriceV4({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder+3', laddersMap }),
      ).toEqual({ decimal: 4, fractional: '3/1', price_boost_type: PriceBoostTypes.BOOST });
    });

    it('returns the boosted price with SUPER_BOOST type for ladder+4', () => {
      expect(
        getLadderBoostedPriceV4({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder+4', laddersMap }),
      ).toEqual({ decimal: 5, fractional: '4/1', price_boost_type: PriceBoostTypes.SUPER_BOOST });
    });

    it('returns the last available ladder when requested ladder exceeds available ladders', () => {
      expect(
        getLadderBoostedPriceV4({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder+8', laddersMap }),
      ).toEqual({ decimal: 6, fractional: '5/1', price_boost_type: PriceBoostTypes.SUPER_BOOST });
    });
  });

  describe('Negative ladders (ladder-X)', () => {
    it('returns the reduced price with STANDARD type for ladder-1', () => {
      expect(getLadderBoostedPriceV4({ sportSlug: 'soccer', decimal: 3, ladderValue: 'ladder-1', laddersMap })).toEqual(
        { decimal: 2, fractional: '1/1', price_boost_type: PriceBoostTypes.STANDARD },
      );
    });

    it('returns the reduced price with STANDARD type for ladder-2', () => {
      expect(getLadderBoostedPriceV4({ sportSlug: 'soccer', decimal: 5, ladderValue: 'ladder-2', laddersMap })).toEqual(
        { decimal: 3, fractional: '2/1', price_boost_type: PriceBoostTypes.STANDARD },
      );
    });

    it('returns the reduced price with STANDARD type for ladder-3', () => {
      expect(getLadderBoostedPriceV4({ sportSlug: 'soccer', decimal: 6, ladderValue: 'ladder-3', laddersMap })).toEqual(
        { decimal: 3, fractional: '2/1', price_boost_type: PriceBoostTypes.STANDARD },
      );
    });

    it('returns the lowest available ladder when requested negative ladder exceeds available ladders', () => {
      expect(getLadderBoostedPriceV4({ sportSlug: 'soccer', decimal: 5, ladderValue: 'ladder-8', laddersMap })).toEqual(
        { decimal: 1.1, fractional: '1/10', price_boost_type: PriceBoostTypes.STANDARD },
      );
    });

    it('handles negative ladder from middle of the range', () => {
      expect(
        getLadderBoostedPriceV4({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder-1', laddersMap }),
      ).toEqual({ decimal: 1.33333, fractional: '1/3', price_boost_type: PriceBoostTypes.STANDARD });
    });
  });

  describe('Edge cases', () => {
    it('returns 0 and STANDARD boost type when foundLadders is empty for positive ladder', () => {
      const laddersMapWithLowOdds = new Map<string, LadderModel[]>([
        [
          'soccer',
          [
            {
              id: 1,
              in_decimal: '1.1',
              pairing_decimal: 1,
              in_fraction: '1/10',
              pairing_fraction: 1,
              sport_slug: 'soccer',
            },
          ],
        ],
      ]);

      expect(
        getLadderBoostedPriceV4({
          sportSlug: 'soccer',
          decimal: 5.0,
          ladderValue: 'ladder+1',
          laddersMap: laddersMapWithLowOdds,
        }),
      ).toEqual({ decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD });
    });

    it('returns 0 and STANDARD boost type when foundLadders is empty for negative ladder', () => {
      const laddersMapWithHighOdds = new Map<string, LadderModel[]>([
        [
          'soccer',
          [
            {
              id: 1,
              in_decimal: '10',
              pairing_decimal: 1,
              in_fraction: '9/1',
              pairing_fraction: 1,
              sport_slug: 'soccer',
            },
          ],
        ],
      ]);

      expect(
        getLadderBoostedPriceV4({
          sportSlug: 'soccer',
          decimal: 1.1,
          ladderValue: 'ladder-1',
          laddersMap: laddersMapWithHighOdds,
        }),
      ).toEqual({ decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD });
    });

    it('handles high precision decimals correctly', () => {
      expect(
        getLadderBoostedPriceV4({
          sportSlug: 'soccer',
          // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
          decimal: 1.33333333333333333333333333333333333333,
          ladderValue: 'ladder+1',
          laddersMap,
        }),
      ).toEqual({ decimal: 2, fractional: '1/1', price_boost_type: PriceBoostTypes.BOOST });

      expect(
        getLadderBoostedPriceV4({
          sportSlug: 'soccer',
          // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
          decimal: 1.33333333333333333333333333333333333333,
          ladderValue: 'ladder-1',
          laddersMap,
        }),
      ).toEqual({ decimal: 1.1, fractional: '1/10', price_boost_type: PriceBoostTypes.STANDARD });
    });

    it('returns fallback when sport slug is not found', () => {
      expect(
        getLadderBoostedPriceV4({ sportSlug: 'socccer', decimal: 1.5, ladderValue: 'ladder+8', laddersMap }),
      ).toEqual({ decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD });
    });
  });

  describe('Master ladder fallback', () => {
    it('falls back to master ladders when sport-specific ladders are not available', () => {
      const laddersMapWithMaster: LaddersMap = new Map([['master', ladders]]);

      expect(
        getLadderBoostedPriceV4({
          sportSlug: 'tennis',
          decimal: 1.5,
          ladderValue: 'ladder+1',
          laddersMap: laddersMapWithMaster,
        }),
      ).toEqual({ decimal: 2, fractional: '1/1', price_boost_type: PriceBoostTypes.BOOST });

      expect(
        getLadderBoostedPriceV4({
          sportSlug: 'tennis',
          decimal: 3,
          ladderValue: 'ladder-1',
          laddersMap: laddersMapWithMaster,
        }),
      ).toEqual({ decimal: 2, fractional: '1/1', price_boost_type: PriceBoostTypes.STANDARD });
    });
  });
});
