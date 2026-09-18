import { BetResultType } from '../../common/constants/betResultType';
import { CastCalculator } from '../../BetCalculator/castCalculator';
import { CastResultType, RaceSelectionStatus } from '../../BetCalculator/castConstants';

// Aliased to the worker's names so the expectations below stay identical to
// swiftyPredictionsELBAPI/tests/casts — any drift in this port fails them.
const betResultTypes = BetResultType;
const castResultTypes = CastResultType;
const CastCalculatorService = new CastCalculator();

// The worker's copy of this test writes `RaceSelectionStatus.OPEN` here. That key has never
// existed on the constant, so it evaluates to `undefined` — "this selection carries no status at
// all", which is exactly what the calculator's pending guard tests. Spelled out because
// TypeScript rejects the non-existent member.
const NO_STATUS = undefined;

describe('Forecast With 2 Hit Selections', () => {
  it('It Should return Hit result', () => {
    const bets = [
      {
        selection_id: 1,
        odd: 1.5,
        status: RaceSelectionStatus.WINNER,
      },
      {
        selection_id: 2,
        odd: 2,
        status: RaceSelectionStatus.PLACED,
      },
    ];

    const selections = [
      {
        selection_id: 1,
        position: 1,
      },
      {
        selection_id: 2,
        position: 2,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 1,
      bets,
      selections,
      dividend: 2,
      stake: 5,
      bet_type: 'forecast',
    });

    expect(result.mainResult).toEqual(betResultTypes.WINNER);
    expect(result.winAmount).toEqual(10);
  });
});

describe('Forecast With 1 Winner and 1 Non Runner Selections', () => {
  it('It Should return Single result', () => {
    const bets = [
      {
        selection_id: 1,
        odd: 1.5,
        status: RaceSelectionStatus.WINNER,
      },
      {
        selection_id: 2,
        odd: 2,
        status: RaceSelectionStatus.NON_RUNNER,
      },
    ];

    const selections = [
      {
        selection_id: 1,
        position: 1,
      },
      {
        selection_id: 3,
        position: 2,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 2,
      bets,
      selections,
      dividend: 2,
      stake: 5,
      bet_type: 'forecast',
    });

    expect(result.mainResult).toEqual(betResultTypes.PARTIAL);
    expect(result.winAmount).toEqual(7.5);
  });
});

describe('Forecast With 2 Non Runner Selections', () => {
  it('It Should return Pushed result', () => {
    const bets = [
      {
        selection_id: 1,
        odd: 1.5,
        status: RaceSelectionStatus.NON_RUNNER,
      },
      {
        selection_id: 2,
        odd: 2,
        status: RaceSelectionStatus.NON_RUNNER,
      },
    ];

    const selections = [
      {
        selection_id: 3,
        position: 1,
      },
      {
        selection_id: 4,
        position: 2,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 3,
      bets,
      selections,
      dividend: 1.5,
      stake: 5,
      bet_type: 'forecast',
    });

    expect(result.mainResult).toEqual(betResultTypes.VOID);
    expect(result.winAmount).toEqual(5);
  });
});

describe('Forecast With 2 Runners, Missed Result', () => {
  it('It Should return Missed result', () => {
    const bets = [
      {
        selection_id: 1,
        odd: 1.5,
        status: RaceSelectionStatus.RUNNER,
      },
      {
        selection_id: 2,
        odd: 2,
        status: RaceSelectionStatus.RUNNER,
      },
    ];
    const selections = [
      {
        selection_id: 2,
        position: 1,
      },
      {
        selection_id: 1,
        position: 2,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 4,
      bets,
      selections,
      dividend: 1.5,
      stake: 5,
      bet_type: 'forecast',
    });

    expect(result.mainResult).toEqual(betResultTypes.LOSER);
    expect(result.winAmount).toEqual(0);
  });
});

describe('Reverse Forecast With 1 Hit Selections', () => {
  it('It Should return Hit result', () => {
    const bets = [
      {
        selection_id: 1,
        odd: 1.5,
        status: RaceSelectionStatus.WINNER,
      },
      {
        selection_id: 2,
        odd: 2,
        status: RaceSelectionStatus.PLACED,
      },
    ];

    const selections = [
      {
        selection_id: 1,
        position: 1,
      },
      {
        selection_id: 2,
        position: 2,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 5,
      bets,
      selections,
      dividend: 2,
      stake: 5,
      total_stake: 10,
      bet_type: 'reverse_forecast',
    });

    expect(result.mainResult).toEqual(betResultTypes.WINNER);
    expect(result.winAmount).toEqual(10);
  });
});

describe('Reverse Forecast With 1 Winner and 1 Non Runner Selections', () => {
  it('It Should return Single result', () => {
    const bets = [
      {
        selection_id: 1,
        odd: 1.5,
        status: RaceSelectionStatus.WINNER,
      },
      {
        selection_id: 2,
        odd: 2,
        status: RaceSelectionStatus.NON_RUNNER,
      },
    ];

    const selections = [
      {
        selection_id: 1,
        position: 1,
      },
      {
        selection_id: 3,
        position: 2,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 6,
      bets,
      selections,
      dividend: 2,
      stake: 5,
      total_stake: 10,
      bet_type: 'reverse_forecast',
    });

    expect(result.mainResult).toEqual(betResultTypes.PARTIAL);
    expect(result.winAmount).toEqual(15);
  });
});

describe('Reverse Forecast With 2 Non Runner Selections', () => {
  it('It Should return Pushed result', () => {
    const bets = [
      {
        selection_id: 1,
        odd: 1.5,
        status: RaceSelectionStatus.NON_RUNNER,
      },
      {
        selection_id: 2,
        odd: 2,
        status: RaceSelectionStatus.NON_RUNNER,
      },
    ];

    const selections = [
      {
        selection_id: 3,
        position: 1,
      },
      {
        selection_id: 4,
        position: 2,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 7,
      bets,
      selections,
      dividend: 2,
      stake: 5,
      total_stake: 10,
      bet_type: 'reverse_forecast',
    });

    expect(result.mainResult).toEqual(betResultTypes.VOID);
    expect(result.winAmount).toEqual(10);
  });
});

describe('Reverse Forecast With 2 Runners, Hit Result', () => {
  it('It Should return Hit result', () => {
    const bets = [
      {
        selection_id: 1,
        odd: 1.5,
        status: RaceSelectionStatus.WINNER,
      },
      {
        selection_id: 2,
        odd: 2,
        status: RaceSelectionStatus.LOSER,
      },
    ];
    const selections = [
      {
        selection_id: 2,
        position: 1,
      },
      {
        selection_id: 1,
        position: 2,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 8,
      bets,
      selections,
      dividend: 2,
      stake: 1,
      total_stake: 2,
      bet_type: 'reverse_forecast',
    });

    expect(result.mainResult).toEqual(betResultTypes.WINNER);
    expect(result.winAmount).toEqual(2);
  });
});

describe('Forecast Combination With 2 Hit Selections', () => {
  it('It Should return Hit result, from 6 combinations', () => {
    const bets = [
      {
        selection_id: 1,
        odd: 1.5,
        status: RaceSelectionStatus.WINNER,
      },
      {
        selection_id: 2,
        odd: 2,
        status: RaceSelectionStatus.PLACED,
      },
      {
        selection_id: 3,
        odd: 3,
        status: RaceSelectionStatus.RUNNER,
      },
    ];

    const selections = [
      {
        selection_id: 1,
        position: 1,
      },
      {
        selection_id: 2,
        position: 2,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 9,
      bets,
      selections,
      dividend: 2,
      stake: 5,
      total_stake: 10,
      bet_type: 'forecast_combination',
    });

    expect(result.mainResult).toEqual(betResultTypes.WINNER);
    expect(result.winAmount).toEqual(10);
    expect(result.results.length).toEqual(6);
  });
});

describe('Forecast Combination With 2 Hit Selections, 1 Push', () => {
  it('It Should return Partial result, from 6 combinations', () => {
    const bets = [
      {
        selection_id: 1,
        odd: 1.5,
        status: RaceSelectionStatus.WINNER,
      },
      {
        selection_id: 2,
        odd: 2,
        status: RaceSelectionStatus.PLACED,
      },
      {
        selection_id: 3,
        odd: 3,
        status: RaceSelectionStatus.NON_RUNNER,
      },
    ];

    const selections = [
      {
        selection_id: 1,
        position: 1,
      },
      {
        selection_id: 2,
        position: 2,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 10,
      bets,
      selections,
      dividend: 2,
      stake: 5,
      total_stake: 10,
      bet_type: 'forecast_combination',
    });

    expect(result.mainResult).toEqual(betResultTypes.PARTIAL);
    expect(result.winAmount).toEqual(25);

    // 1 hit, 2 singles, 1 missed, and total 6
    expect(result.results.filter((r) => r.result === castResultTypes.HIT).length).toEqual(1);
    expect(result.results.filter((r) => r.result === castResultTypes.SINGLE).length).toEqual(2);
    expect(result.results.filter((r) => r.result === castResultTypes.MISSED).length).toEqual(3);
    expect(result.results.filter((r) => r.result === castResultTypes.VOID).length).toEqual(0);
    expect(result.results.length).toEqual(6);
  });
});

describe('Forecast Combination With 1 Hit Selections, 2 Push', () => {
  it('It Should return Hit result, from 6 combinations', () => {
    const bets = [
      {
        selection_id: 1,
        odd: 1.5,
        status: RaceSelectionStatus.WINNER,
      },
      {
        selection_id: 2,
        odd: 2,
        status: RaceSelectionStatus.NON_RUNNER,
      },
      {
        selection_id: 3,
        odd: 3,
        status: RaceSelectionStatus.NON_RUNNER,
      },
    ];

    const selections = [
      {
        selection_id: 1,
        position: 1,
      },
      {
        selection_id: 2,
        position: 2,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 11,
      bets,
      selections,
      dividend: 2,
      stake: 5,
      total_stake: 10,
      bet_type: 'forecast_combination',
    });

    expect(result.mainResult).toEqual(betResultTypes.PARTIAL);

    expect(result.winAmount).toEqual(40);

    // 4 singles 2 pushed, total 6
    expect(result.results.filter((r) => r.result === castResultTypes.SINGLE).length).toEqual(4);
    expect(result.results.filter((r) => r.result === castResultTypes.VOID).length).toEqual(2);
    expect(result.results.length).toEqual(6);
  });
});

describe('Forecast Combination With All Non-Runner Selections', () => {
  it('It Should return Void result when all selections are non-runners, refunding the stake', () => {
    const bets = [
      {
        selection_id: 1,
        odd: 1.5,
        status: RaceSelectionStatus.NON_RUNNER,
      },
      {
        selection_id: 2,
        odd: 2,
        status: RaceSelectionStatus.NON_RUNNER,
      },
      {
        selection_id: 3,
        odd: 3,
        status: RaceSelectionStatus.NON_RUNNER,
      },
    ];

    const selections = [
      {
        selection_id: 1,
        position: 1,
      },
      {
        selection_id: 2,
        position: 2,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 12,
      bets,
      selections,
      dividend: 2,
      stake: 5,
      total_stake: 10,
      bet_type: 'forecast_combination',
    });

    expect(result.mainResult).toEqual(betResultTypes.VOID);

    expect(result.winAmount).toEqual(30);

    // all pushed
    expect(result.results.filter((r) => r.result === castResultTypes.VOID).length).toEqual(6);
    expect(result.results.length).toEqual(6);
  });
});

describe('Forecast Combination With 1 Hit Selections, 3 Push', () => {
  it('It Should return Hit result, from 6 combinations', () => {
    const bets = [
      {
        selection_id: 1,
        odd: 1.5,
        status: RaceSelectionStatus.WINNER,
      },
      {
        selection_id: 2,
        odd: 2,
        status: RaceSelectionStatus.RUNNER,
      },
      {
        selection_id: 3,
        odd: 3,
        status: RaceSelectionStatus.RUNNER,
      },
    ];

    const selections = [
      {
        selection_id: 1,
        position: 1,
      },
      {
        selection_id: 3,
        position: 2,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 13,
      bets,
      selections,
      dividend: 2,
      stake: 5,
      total_stake: 10,
      bet_type: 'forecast_combination',
    });

    // all pushed
    expect(result.mainResult).toEqual(betResultTypes.WINNER);
    expect(result.winAmount).toEqual(10);
    expect(result.results.length).toEqual(6);
    expect(result.results.filter((r) => r.result === castResultTypes.HIT).length).toEqual(1);
    expect(result.results.filter((r) => r.result === castResultTypes.MISSED).length).toEqual(5);
  });

  describe('Forecast Combination With 1 Hit Selections, all runners', () => {
    it('It Should return Hit result, from 12 combinations', () => {
      const bets = [
        {
          selection_id: 1,
          odd: 1.5,
          status: RaceSelectionStatus.WINNER,
        },
        {
          selection_id: 2,
          odd: 2,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 3,
          odd: 3,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 4,
          odd: 4,
          status: RaceSelectionStatus.RUNNER,
        },
      ];

      const selections = [
        {
          selection_id: 1,
          position: 1,
        },
        {
          selection_id: 3,
          position: 2,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 14,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        total_stake: 10,
        bet_type: 'forecast_combination',
      });

      // all pushed
      expect(result.mainResult).toEqual(betResultTypes.WINNER);
      expect(result.winAmount).toEqual(10);
      expect(result.results.length).toEqual(12);
      expect(result.results.filter((r) => r.result === castResultTypes.HIT).length).toEqual(1);
      expect(result.results.filter((r) => r.result === castResultTypes.MISSED).length).toEqual(11);
    });
  });

  describe('Forecast Combination With 1 Hit Selections, 1 pushed', () => {
    it('It Should return Hit result, from 12 combinations', () => {
      const bets = [
        {
          selection_id: 1,
          odd: 1.5,
          status: RaceSelectionStatus.WINNER,
        },
        {
          selection_id: 2,
          odd: 2,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 3,
          odd: 3,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 4,
          odd: 4,
          status: RaceSelectionStatus.NON_RUNNER,
        },
      ];

      const selections = [
        {
          selection_id: 1,
          position: 1,
        },
        {
          selection_id: 3,
          position: 2,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 15,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        total_stake: 10,
        bet_type: 'forecast_combination',
      });

      // all pushed
      expect(result.mainResult).toEqual(betResultTypes.PARTIAL);
      expect(result.winAmount).toEqual(25);
      expect(result.results.length).toEqual(12);
      expect(result.results.filter((r) => r.result === castResultTypes.HIT).length).toEqual(1);
      expect(result.results.filter((r) => r.result === castResultTypes.MISSED).length).toEqual(9);
      expect(result.results.filter((r) => r.result === castResultTypes.SINGLE).length).toEqual(2);
      expect(result.results.filter((r) => r.result === castResultTypes.VOID).length).toEqual(0);
    });
  });
});

describe('Forecast Combination With 1 Hit Selections, 3 Push', () => {
  it('It Should return Hit result, from 6 combinations', () => {
    const bets = [
      {
        selection_id: 1,
        odd: 1.5,
        status: RaceSelectionStatus.WINNER,
      },
      {
        selection_id: 2,
        odd: 2,
        status: RaceSelectionStatus.RUNNER,
      },
      {
        selection_id: 3,
        odd: 3,
        status: RaceSelectionStatus.RUNNER,
      },
    ];

    const selections = [
      {
        selection_id: 1,
        position: 1,
      },
      {
        selection_id: 3,
        position: 2,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 13,
      bets,
      selections,
      dividend: 2,
      stake: 5,
      total_stake: 10,
      bet_type: 'forecast_combination',
    });

    // all pushed
    expect(result.mainResult).toEqual(betResultTypes.WINNER);
    expect(result.winAmount).toEqual(10);
    expect(result.results.length).toEqual(6);
    expect(result.results.filter((r) => r.result === castResultTypes.HIT).length).toEqual(1);
    expect(result.results.filter((r) => r.result === castResultTypes.MISSED).length).toEqual(5);
  });

  describe('Forecast Combination With 1 Hit Selections, all runners', () => {
    it('It Should return Hit result, from 12 combinations', () => {
      const bets = [
        {
          selection_id: 1,
          odd: 1.5,
          status: RaceSelectionStatus.WINNER,
        },
        {
          selection_id: 2,
          odd: 2,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 3,
          odd: 3,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 4,
          odd: 4,
          status: RaceSelectionStatus.RUNNER,
        },
      ];

      const selections = [
        {
          selection_id: 1,
          position: 1,
        },
        {
          selection_id: 3,
          position: 2,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 14,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        total_stake: 10,
        bet_type: 'forecast_combination',
      });

      // all pushed
      expect(result.mainResult).toEqual(betResultTypes.WINNER);
      expect(result.winAmount).toEqual(10);
      expect(result.results.length).toEqual(12);
      expect(result.results.filter((r) => r.result === castResultTypes.HIT).length).toEqual(1);
      expect(result.results.filter((r) => r.result === castResultTypes.MISSED).length).toEqual(11);
    });
  });

  describe('Forecast Combination With At least one Open selection', () => {
    it('It Should return Not Applicable result, and not set any result', () => {
      const bets = [
        {
          selection_id: 1,
          odd: 1.5,
          status: RaceSelectionStatus.WINNER,
        },
        {
          selection_id: 2,
          odd: 2,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 3,
          odd: 3,
          status: NO_STATUS,
        },
        {
          selection_id: 4,
          odd: 4,
          status: RaceSelectionStatus.NON_AVAILABLE,
        },
      ];

      const selections = [
        {
          selection_id: 1,
          position: 1,
        },
        {
          selection_id: 3,
          position: 2,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 15,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        total_stake: 10,
        bet_type: 'forecast_combination',
      });

      // all pushed
      expect(result.mainResult).toEqual(betResultTypes.OPEN);
      expect(result.winAmount).toEqual(0);
      expect(result.results.length).toEqual(1);
      expect(result.results[0].result).toEqual(castResultTypes.NOT_APPLICABLE);
    });
  });
});

describe('Forecast Combination With 1 Hit Selections, 3 Push', () => {
  it('It Should return Hit result, from 6 combinations', () => {
    const bets = [
      {
        selection_id: 1,
        odd: 1.5,
        status: RaceSelectionStatus.NON_RUNNER,
      },
      {
        selection_id: 2,
        odd: 2,
        status: RaceSelectionStatus.NON_RUNNER,
      },
      {
        selection_id: 3,
        odd: 3,
        status: RaceSelectionStatus.NON_RUNNER,
      },
    ];

    const selections = [
      {
        selection_id: 1,
        position: 1,
      },
      {
        selection_id: 2,
        position: 2,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 12,
      bets,
      selections,
      dividend: 2,
      stake: 5,
      total_stake: 10,
      bet_type: 'forecast_combination',
    });

    // Every line is VOID (all three selections were non-runners), so the whole bet is VOID and
    // the stake is refunded per line. It used to grade PARTIAL because the "some VOID" check ran
    // before the "all VOID" one; this expectation was left behind when that was fixed.
    expect(result.mainResult).toEqual(betResultTypes.VOID);

    expect(result.winAmount).toEqual(30);

    // all pushed
    expect(result.results.filter((r) => r.result === castResultTypes.VOID).length).toEqual(6);
    expect(result.results.length).toEqual(6);
  });
});

describe('Forecast Combination With 1 Hit Selections, 3 Push', () => {
  it('It Should return Hit result, from 6 combinations', () => {
    const bets = [
      {
        selection_id: 1,
        odd: 1.5,
        status: RaceSelectionStatus.WINNER,
      },
      {
        selection_id: 2,
        odd: 2,
        status: RaceSelectionStatus.RUNNER,
      },
      {
        selection_id: 3,
        odd: 3,
        status: RaceSelectionStatus.RUNNER,
      },
    ];

    const selections = [
      {
        selection_id: 1,
        position: 1,
      },
      {
        selection_id: 3,
        position: 2,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 13,
      bets,
      selections,
      dividend: 2,
      stake: 5,
      total_stake: 10,
      bet_type: 'forecast_combination',
    });

    // all pushed
    expect(result.mainResult).toEqual(betResultTypes.WINNER);
    expect(result.winAmount).toEqual(10);
    expect(result.results.length).toEqual(6);
    expect(result.results.filter((r) => r.result === castResultTypes.HIT).length).toEqual(1);
    expect(result.results.filter((r) => r.result === castResultTypes.MISSED).length).toEqual(5);
  });

  describe('Forecast Combination With 1 Hit Selections, all runners', () => {
    it('It Should return Hit result, from 12 combinations', () => {
      const bets = [
        {
          selection_id: 1,
          odd: 1.5,
          status: RaceSelectionStatus.WINNER,
        },
        {
          selection_id: 2,
          odd: 2,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 3,
          odd: 3,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 4,
          odd: 4,
          status: RaceSelectionStatus.RUNNER,
        },
      ];

      const selections = [
        {
          selection_id: 1,
          position: 1,
        },
        {
          selection_id: 3,
          position: 2,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 14,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        total_stake: 10,
        bet_type: 'forecast_combination',
      });

      // all pushed
      expect(result.mainResult).toEqual(betResultTypes.WINNER);
      expect(result.winAmount).toEqual(10);
      expect(result.results.length).toEqual(12);
      expect(result.results.filter((r) => r.result === castResultTypes.HIT).length).toEqual(1);
      expect(result.results.filter((r) => r.result === castResultTypes.MISSED).length).toEqual(11);
    });
  });

  describe('Forecast Combination With 1 Hit Selections, 1 pushed', () => {
    it('It Should return Hit result, from 12 combinations', () => {
      const bets = [
        {
          selection_id: 1,
          odd: 1.5,
          status: RaceSelectionStatus.WINNER,
        },
        {
          selection_id: 2,
          odd: 2,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 3,
          odd: 3,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 4,
          odd: 4,
          status: RaceSelectionStatus.NON_RUNNER,
        },
      ];

      const selections = [
        {
          selection_id: 1,
          position: 1,
        },
        {
          selection_id: 3,
          position: 2,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 15,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        total_stake: 10,
        bet_type: 'forecast_combination',
      });

      // all pushed
      expect(result.mainResult).toEqual(betResultTypes.PARTIAL);
      expect(result.winAmount).toEqual(25);
      expect(result.results.length).toEqual(12);
      expect(result.results.filter((r) => r.result === castResultTypes.HIT).length).toEqual(1);
      expect(result.results.filter((r) => r.result === castResultTypes.MISSED).length).toEqual(9);
      expect(result.results.filter((r) => r.result === castResultTypes.SINGLE).length).toEqual(2);
      expect(result.results.filter((r) => r.result === castResultTypes.VOID).length).toEqual(0);
    });
  });
});
