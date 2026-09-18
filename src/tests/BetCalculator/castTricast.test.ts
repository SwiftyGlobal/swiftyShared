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

describe('Tricast Straight', () => {
  describe('Tricast With 3 Hit Selections', () => {
    it('Should return Winner result with 1 Hit', () => {
      const bets = [
        {
          selection_id: 1,
          odd: 3,
          status: RaceSelectionStatus.WINNER,
        },
        {
          selection_id: 2,
          odd: 2.65,
          status: RaceSelectionStatus.PLACED,
        },
        {
          selection_id: 3,
          odd: 8,
          status: RaceSelectionStatus.LOSER,
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
        {
          selection_id: 3,
          position: 3,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 1,
        bets,
        selections,
        dividend: 23.13,
        stake: 15,
        bet_type: 'tricast',
      });

      expect(result.mainResult).toEqual(betResultTypes.WINNER);
      expect(result.results.filter((r) => r.result === castResultTypes.HIT).length).toEqual(1);
      expect(result.results.length).toEqual(1);
      expect(result.winAmount).toEqual(346.95);
    });
  });

  describe('Tricast With 2 Hit Selections, 1 Push', () => {
    it('Should return Partial result with 1 Forecast', () => {
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
        {
          selection_id: 4,
          position: 3,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 2,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        // The CSF dividend the degraded line is paid at. A tricast that loses a selection to a
        // non-runner becomes a forecast on the survivors and must be priced off the race's
        // FORECAST dividend — never off the tricast one, which is far larger.
        forecastDividend: 4,
        bet_type: 'tricast',
      });

      expect(result.mainResult).toEqual(betResultTypes.PARTIAL);
      expect(result.results.filter((r) => r.result === castResultTypes.FORECAST).length).toEqual(1);
      expect(result.results.length).toEqual(1);
      expect(result.winAmount).toEqual(20); // stake 5 x CSF 4
    });
  });

  describe('Tricast With 1 Hit Selection, 2 Push', () => {
    it('Should return Partial result with 1 Single', () => {
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
          selection_id: 4,
          position: 2,
        },
        {
          selection_id: 5,
          position: 3,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 3,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        bet_type: 'tricast',
      });

      expect(result.mainResult).toEqual(betResultTypes.PARTIAL);
      expect(result.results.filter((r) => r.result === castResultTypes.SINGLE).length).toEqual(1);
      expect(result.results.length).toEqual(1);
      expect(result.winAmount).toEqual(7.5);
    });
  });

  describe('Tricast With 3 Push', () => {
    it('Should return Pushed result with 1 Pushed', () => {
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
          selection_id: 4,
          position: 1,
        },
        {
          selection_id: 5,
          position: 2,
        },
        {
          selection_id: 6,
          position: 3,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 4,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        bet_type: 'tricast',
      });

      expect(result.mainResult).toEqual(betResultTypes.VOID);
      expect(result.results.filter((r) => r.result === castResultTypes.VOID).length).toEqual(1);
      expect(result.results.length).toEqual(1);
      expect(result.winAmount).toEqual(5);
    });
  });

  describe('Tricast With Missed Selections', () => {
    it('Should return Loser result with 1 Missed', () => {
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
        {
          selection_id: 3,
          odd: 3,
          status: RaceSelectionStatus.RUNNER,
        },
      ];

      const selections = [
        {
          selection_id: 4,
          position: 1,
        },
        {
          selection_id: 5,
          position: 2,
        },
        {
          selection_id: 6,
          position: 3,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 5,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        bet_type: 'tricast',
      });

      expect(result.mainResult).toEqual(betResultTypes.LOSER);
      expect(result.results.filter((r) => r.result === castResultTypes.MISSED).length).toEqual(1);
      expect(result.results.length).toEqual(1);
      expect(result.winAmount).toEqual(0);
    });
  });

  describe('Tricast With Open Selection', () => {
    it('Should return Open result with 1 Not Applicable', () => {
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
          status: NO_STATUS,
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
        {
          selection_id: 3,
          position: 3,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 6,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        bet_type: 'tricast',
      });

      expect(result.mainResult).toEqual(betResultTypes.OPEN);
      expect(result.results.filter((r) => r.result === castResultTypes.NOT_APPLICABLE).length).toEqual(1);
      expect(result.results.length).toEqual(1);
      expect(result.winAmount).toEqual(0);
    });
  });

  describe('Tricast With Non Available Selection', () => {
    it('Should return Open result with 1 Not Applicable', () => {
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
          status: RaceSelectionStatus.NON_AVAILABLE,
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
        {
          selection_id: 3,
          position: 3,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 7,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        bet_type: 'tricast',
      });

      expect(result.mainResult).toEqual(betResultTypes.OPEN);
      expect(result.results.filter((r) => r.result === castResultTypes.NOT_APPLICABLE).length).toEqual(1);
      expect(result.results.length).toEqual(1);
      expect(result.winAmount).toEqual(0);
    });
  });

  describe('Tricast With Wrong Order', () => {
    it('Should return Loser result with 1 Missed', () => {
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
          selection_id: 3,
          position: 2,
        },
        {
          selection_id: 2,
          position: 3,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 8,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        bet_type: 'tricast',
      });

      expect(result.mainResult).toEqual(betResultTypes.LOSER);
      expect(result.results.filter((r) => r.result === castResultTypes.MISSED).length).toEqual(1);
      expect(result.results.length).toEqual(1);
      expect(result.winAmount).toEqual(0);
    });
  });
});

describe('Tricast Combination', () => {
  describe('Tricast Combination With 4 Selections', () => {
    it('Should return Winner result with 1 Hit and 23 Missed', () => {
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
          selection_id: 2,
          position: 2,
        },
        {
          selection_id: 3,
          position: 3,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 9,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        bet_type: 'tricast_combination',
      });

      expect(result.mainResult).toEqual(betResultTypes.WINNER);
      expect(result.results.filter((r) => r.result === castResultTypes.HIT).length).toEqual(1);
      expect(result.results.filter((r) => r.result === castResultTypes.MISSED).length).toEqual(23);
      expect(result.results.length).toEqual(24);
      expect(result.winAmount).toEqual(10);
    });

    it('Should return Partial result with 1 Forecast and 23 Missed when 2 selections hit and 1 is non-runner', () => {
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
          selection_id: 2,
          position: 2,
        },
        {
          selection_id: 5,
          position: 3,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 10,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        forecastDividend: 4, // degraded lines pay the CSF dividend, not the tricast one
        bet_type: 'tricast_combination',
      });

      expect(result.mainResult).toEqual(betResultTypes.PARTIAL);
      // Only the 3 lines whose two survivors sit in the order they actually finished (1 then 2)
      // degrade to a forecast: 1-2-3, 1-3-2 and 3-1-2. The mirrored lines (2-1-3, 2-3-1, 3-2-1)
      // back the survivors the other way round and miss — the punter bought that cover as its
      // own line, so paying both orders here would pay the same cover twice.
      expect(result.results.filter((r) => r.result === castResultTypes.FORECAST).length).toEqual(3);
      expect(result.results.filter((r) => r.result === castResultTypes.MISSED).length).toEqual(21);
      expect(result.results.length).toEqual(24);
      expect(result.winAmount).toEqual(60); // 3 lines x stake 5 x CSF 4
    });
  });

  describe('Tricast Combination With 5 Selections', () => {
    it('Should return Winner result with 1 Hit and 59 Missed', () => {
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
        {
          selection_id: 4,
          odd: 4,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 5,
          odd: 5,
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
        {
          selection_id: 3,
          position: 3,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 11,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        bet_type: 'tricast_combination',
      });

      expect(result.mainResult).toEqual(betResultTypes.WINNER);
      expect(result.results.filter((r) => r.result === castResultTypes.HIT).length).toEqual(1);
      expect(result.results.filter((r) => r.result === castResultTypes.MISSED).length).toEqual(59);
      expect(result.results.length).toEqual(60);
      expect(result.winAmount).toEqual(10);
    });

    it('Should return Partial result with 6 Singles and 54 Missed when 1 selection hits and 2 are non-runners', () => {
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
        {
          selection_id: 4,
          odd: 4,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 5,
          odd: 5,
          status: RaceSelectionStatus.RUNNER,
        },
      ];

      const selections = [
        {
          selection_id: 1,
          position: 1,
        },
        {
          selection_id: 6,
          position: 2,
        },
        {
          selection_id: 7,
          position: 3,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 12,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        bet_type: 'tricast_combination',
      });

      expect(result.mainResult).toEqual(betResultTypes.PARTIAL);
      expect(result.results.filter((r) => r.result === castResultTypes.SINGLE).length).toEqual(6);
      expect(result.results.filter((r) => r.result === castResultTypes.MISSED).length).toEqual(54);
      expect(result.results.length).toEqual(60);
      expect(result.winAmount).toEqual(45);
    });
  });

  describe('Tricast Combination With 6 Selections', () => {
    it('Should return Winner result with 1 Hit and 119 Missed', () => {
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
        {
          selection_id: 4,
          odd: 4,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 5,
          odd: 5,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 6,
          odd: 6,
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
        {
          selection_id: 3,
          position: 3,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 13,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        bet_type: 'tricast_combination',
      });

      expect(result.mainResult).toEqual(betResultTypes.WINNER);
      expect(result.results.filter((r) => r.result === castResultTypes.HIT).length).toEqual(1);
      expect(result.results.filter((r) => r.result === castResultTypes.MISSED).length).toEqual(119);
      expect(result.results.length).toEqual(120);
      expect(result.winAmount).toEqual(10);
    });

    it('Should return Open result when one selection is OPEN', () => {
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
          status: NO_STATUS,
        },
        {
          selection_id: 4,
          odd: 4,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 5,
          odd: 5,
          status: RaceSelectionStatus.RUNNER,
        },
        {
          selection_id: 6,
          odd: 6,
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
        {
          selection_id: 3,
          position: 3,
        },
      ];

      const result = CastCalculatorService.calculateCasts({
        prefix: 'test',
        betted_id: 14,
        bets,
        selections,
        dividend: 2,
        stake: 5,
        bet_type: 'tricast_combination',
      });

      expect(result.mainResult).toEqual(betResultTypes.OPEN);
      expect(result.results.filter((r) => r.result === castResultTypes.NOT_APPLICABLE).length).toEqual(1);
      expect(result.results.length).toEqual(1);
      expect(result.winAmount).toEqual(0);
    });
  });
});

describe('Tricast Combination With All Non-Runner Selections', () => {
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
        selection_id: 2,
        position: 2,
      },
      {
        selection_id: 3,
        position: 3,
      },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 15,
      bets,
      selections,
      dividend: 10,
      stake: 5,
      bet_type: 'tricast_combination',
    });

    expect(result.mainResult).toEqual(betResultTypes.VOID);

    // all combinations should be void (4 selections = 4*3*2 = 24 combinations, all void at odd 1)
    expect(result.results.every((r) => r.result === castResultTypes.VOID)).toBe(true);
    expect(result.winAmount).toEqual(result.results.length * 5);
  });
});
