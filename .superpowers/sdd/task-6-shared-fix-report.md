# Task 6 – swiftyShared: Up-and-Down Dead-Heat Formula Fix

## Formula Change

**File:** `src/BetCalculator/upAndDown.ts`

**Old (profit-shrink — overpays):**
```ts
return 1 + (baseOdds - 1) * fraction;
```

**New (stake-divide — canonical dead-heat rule):**
```ts
return baseOdds * fraction;
```

Dead-heat rule: 1/N of the stake is active at full odds.
The return multiplier for the leg is `odds × fraction`.
When `fraction` is null (→ 1), `baseOdds × 1 === baseOdds` — non-dead-heat behaviour is unchanged.

JSDoc on `deadHeatFraction` updated from "Shrinks the profit fraction of the effective odds" to "Divides the stake: 1/N of stake at full odds (return = odds × fraction)".

---

## Dead-Heat Test Cases Updated

Only one test case used a non-null `deadHeatFraction`:

| # | Test (title) | Old expected | New expected | Arithmetic |
|---|---|---|---|---|
| 1 | `dead-heat divides stake: A half-won@3 (f=0.5), B win@2 -> 50` | 60 | 50 | See below |

**Old formula arithmetic (expected 60):**
- effectiveOdds(A) = 1 + (3−1)×0.5 = 2.0
- Direction A→B: part1Return = 10×2=20; atcStake=min(10,20)=10; leftover=10; atcReturn=10×2=20; total=30
- Direction B→A: part1Return=10×2=20; atcStake=10; leftover=10; atcReturn=10×2=20; total=30
- Grand total = 60

**New formula arithmetic (expected 50):**
- effectiveOdds(A) = 3×0.5 = 1.5
- Direction A→B: part1Return=10×1.5=15; atcStake=min(10,15)=10; leftover=5; atcReturn=10×2=20; total=25
- Direction B→A: part1Return=10×2=20; atcStake=10; leftover=10; atcReturn=10×1.5=15; total=25
- Grand total = 50

---

## Non-Dead-Heat Tests — Unchanged

All 13 non-dead-heat tests passed with identical expected values. The `baseOdds * 1 === baseOdds` identity preserves all non-DH behaviour.

---

## tsc + Test Results

```
npx tsc --noEmit -p tsconfig.json   → clean (no output)

npx jest src/tests/BetCalculator/upAndDown.test.ts
  PASS
  14 tests: 14 passed, 0 failed
  Time: 0.192 s
```

---

## Version Bump

`package.json`: `1.0.139` → `1.0.140`

---

## Build Result

```
npm run build
@swiftyglobal/swifty-shared@1.0.140 build
rimraf dist && tsc && npm run build:ui
→ Copied CSS assets to dist/ui
BUILD GREEN
```

---

## Commit

Branch: `fix/up-and-down-deadheat`
Commit message: `fix(bet-calculator): up-and-down dead-heat divides stake (was overpaying via profit-shrink)`
