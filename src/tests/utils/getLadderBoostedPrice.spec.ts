import { getLadderBoostedPriceV3 } from '../../utils';
import type { LadderModel } from '../../models';
import type { LaddersMap } from '../../types';
import { PriceBoostTypes } from '../../common';

describe('getLadderBoostedPriceV3', () => {
  const ladders: LadderModel[] = [
    {
      id: 1,
      in_decimal: '1.1',
      pairing_decimal: 1,
      in_fraction: '1/1',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
    {
      id: 1,
      in_decimal: '1.33333',
      pairing_decimal: 1,
      in_fraction: '1/1',
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
      in_fraction: '1/1',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
    {
      id: 1,
      in_decimal: '4',
      pairing_decimal: 1,
      in_fraction: '1/1',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
    {
      id: 1,
      in_decimal: '5',
      pairing_decimal: 1,
      in_fraction: '1/1',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
    {
      id: 1,
      in_decimal: '6',
      pairing_decimal: 1,
      in_fraction: '1/1',
      pairing_fraction: 1,
      sport_slug: 'soccer',
    },
  ];

  const laddersMap: LaddersMap = new Map([['soccer', ladders]]);

  it('returns 0 and standard boost type when decimal is not available or ladder is -1', () => {
    expect(
      getLadderBoostedPriceV3({ sportSlug: 'soccer', decimal: 0, ladderValue: 'ladder+1', laddersMap: new Map() }),
    ).toEqual({ decimal: 0, price_boost_type: PriceBoostTypes.STANDARD });

    expect(
      getLadderBoostedPriceV3({ sportSlug: 'soccer', decimal: 1.5, ladderValue: '-1', laddersMap: new Map() }),
    ).toEqual({ decimal: 0, price_boost_type: PriceBoostTypes.STANDARD });
  });

  it('returns 0 and standard boost type if no ladders are found', () => {
    expect(
      getLadderBoostedPriceV3({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder+1', laddersMap: new Map() }),
    ).toEqual({ decimal: 0, price_boost_type: PriceBoostTypes.STANDARD });
  });

  it('returns the boosted price and boost type based on the ladder and decimal', () => {
    expect(getLadderBoostedPriceV3({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder+1', laddersMap })).toEqual(
      { decimal: 2, price_boost_type: PriceBoostTypes.BOOST },
    );

    expect(getLadderBoostedPriceV3({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder+4', laddersMap })).toEqual(
      { decimal: 5, price_boost_type: PriceBoostTypes.SUPER_BOOST },
    );
  });

  it('returns the correct boosted price and boost type for negative ladders', () => {
    expect(getLadderBoostedPriceV3({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder-1', laddersMap })).toEqual(
      { decimal: 1.33333, price_boost_type: PriceBoostTypes.STANDARD },
    );
  });

  it('returns the correct boosted price and boost type when ladders are less than requested', () => {
    expect(getLadderBoostedPriceV3({ sportSlug: 'soccer', decimal: 1.5, ladderValue: 'ladder-8', laddersMap })).toEqual(
      { decimal: 1.1, price_boost_type: PriceBoostTypes.STANDARD },
    );
  });

  it('returns fallback boosted price and boost type when ladders are not available for any reason', () => {
    // Put wrong sport slug for the ladders to test if it falls back to the standard boost
    expect(
      getLadderBoostedPriceV3({ sportSlug: 'socccer', decimal: 1.5, ladderValue: 'ladder+8', laddersMap }),
    ).toEqual({ decimal: 0, price_boost_type: PriceBoostTypes.STANDARD });
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
    ).toEqual({ decimal: 0, price_boost_type: PriceBoostTypes.STANDARD });
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
    ).toEqual({ decimal: 2, price_boost_type: PriceBoostTypes.BOOST });

    expect(
      getLadderBoostedPriceV3({
        sportSlug: 'soccer',
        // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
        decimal: 1.33333333333333333333333333333333333333,
        ladderValue: 'ladder-1',
        laddersMap,
      }),
    ).toEqual({ decimal: 1.1, price_boost_type: PriceBoostTypes.STANDARD });

    expect(
      getLadderBoostedPriceV3({
        sportSlug: 'soccer',
        decimal: 1.44444444,
        ladderValue: 'ladder+1',
        laddersMap,
      }),
    ).toEqual({ decimal: 2, price_boost_type: PriceBoostTypes.BOOST });
  });
});
