# swiftyShared: provider `r` and the feed racing status helper

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish 1.0.151 with the `r` provider in every registry, the feed racing event status helper, and the feed's `cancelled` status in the cast void table.

**Architecture:** Three additive changes in the existing registries (`providerPrefixes.ts`, `eventStatuses.ts`, `castConstants.ts`), one new DTO, one new helper mirroring `getRasEventStatus`, tests next to the RAS ones, version bump in the feature commit.

**Tech Stack:** TypeScript, jest. Worktree on branch `feat/6054-swifty-feed-racing-provider`, PR to `master`.

**Spec:** `docs/superpowers/specs/2026-10-05-swifty-feed-racing-provider-r-design.md` section 4.1.

## Global Constraints

- The master plan (orchestration across the repos) lives with the ticket outside the repos; the constraints every repo shares are in the spec's section 3. Lint baseline on clean master: 156 problems; lint only your files.
- `node_modules` is NOT gitignored here: stage explicit paths, never `git add -A`.
- Version bump: `package.json` `version` and BOTH top-of-file spots in `package-lock.json` (`"version": "1.0.150"` appears at line 3 and inside `packages[""]`).

## Review Focus

1. `resulted` arriving as the string `'1'` or the number `1` (mysql2 hands tinyint back as a number; typed rows pass strings): both mean finished. Test in Task 2.
2. `status` null with `off_time` set means in play (a feed row that lost its status but has gone off). Test in Task 2.
3. A future `DG` category must not change the helper (it is status-driven, not sport-driven). No test needed; noted.

---

### Task 1: Provider registry gains `r`

**Files:**
- Modify: `src/common/constants/providerPrefixes.ts`
- Modify: `src/types/sportProviders.ts`
- Test: `src/tests/common/providerPrefixes.spec.ts` (create)

**Interfaces:**
- Produces: `Providers.SWIFTY_FEED_RACING = 'swifty-feed-racing'`, `ProviderPrefixes.r`, `FeedProviders.SWIFTY_FEED_RACING = 'r'`, `FeedProvidersNames.r = 'Swifty Feed Racing'`, `RacingSportProviders` includes `'r'`.

- [ ] **Step 1: Write the failing test**

```ts
// src/tests/common/providerPrefixes.spec.ts
import { FeedProviders, FeedProvidersNames, ProviderPrefixes, Providers } from '../../common';

describe('swifty feed racing provider registry', () => {
  it('registers r as the swifty feed racing provider', () => {
    expect(Providers.SWIFTY_FEED_RACING).toBe('swifty-feed-racing');
    expect(ProviderPrefixes.r).toBe(Providers.SWIFTY_FEED_RACING);
    expect(FeedProviders.SWIFTY_FEED_RACING).toBe('r');
    expect(FeedProvidersNames.r).toBe('Swifty Feed Racing');
  });

  it('keeps golf on s', () => {
    expect(ProviderPrefixes.s).toBe(Providers.SWIFTY_FEED);
    expect(FeedProviders.SWIFTY_FEED).toBe('s');
  });
});
```

- [ ] **Step 2: Run it, expect a compile failure on the missing members**

Run: `npx jest src/tests/common/providerPrefixes.spec.ts`
Expected: FAIL (`SWIFTY_FEED_RACING` does not exist).

- [ ] **Step 3: Add the members**

In `src/common/constants/providerPrefixes.ts`:

```ts
export enum Providers {
  // ... existing ...
  SWIFTY_FEED = 'swifty-feed',
  SWIFTY_FEED_RACING = 'swifty-feed-racing',
}

export const ProviderPrefixes = {
  // ... existing ...
  s: Providers.SWIFTY_FEED,
  r: Providers.SWIFTY_FEED_RACING,
} as const;

export const FeedProviders = {
  // ... existing ...
  SWIFTY_FEED: 's',
  SWIFTY_FEED_RACING: 'r',
} as const;

export const FeedProvidersNames = {
  // ... existing ...
  [FeedProviders.SWIFTY_FEED]: 'Swifty Feed',
  [FeedProviders.SWIFTY_FEED_RACING]: 'Swifty Feed Racing',
};
```

In `src/types/sportProviders.ts` add the doc line ` * r - swifty feed racing (stored under swifty_feed, racing_* tables)` and change:

```ts
export type RacingSportProviders = Extract<SportProviders, 'c' | 'd' | 'h' | 'r'>;
```

- [ ] **Step 4: Run the test and the whole suite**

Run: `npx jest src/tests/common/providerPrefixes.spec.ts` then `npx jest`
Expected: PASS; no other suite changes (a suite that enumerates prefixes may need `r` added to its expectation; if so, add it, that is the point).

- [ ] **Step 5: Commit**

```bash
git add src/common/constants/providerPrefixes.ts src/types/sportProviders.ts src/tests/common/providerPrefixes.spec.ts
git commit -m "feat(providers): register the swifty feed racing provider r"
```

---

### Task 2: Feed racing event status helper

**Files:**
- Modify: `src/common/constants/eventStatuses.ts`
- Create: `src/common/dto/events/getSwiftyFeedRacingEventStatus.dto.ts`
- Modify: `src/common/dto/events/index.ts`
- Create: `src/utils/events/getSwiftyFeedRacingEventStatus.ts`
- Modify: `src/utils/events/index.ts`
- Test: `src/tests/utils/events/getSwiftyFeedRacingEventStatus.spec.ts`

**Interfaces:**
- Produces: `getSwiftyFeedRacingEventStatus(payload: GetSwiftyFeedRacingEventStatusDto): SportEventStatuses` and `EventStatuses.SWIFTY_FEED_RACING`.
- Consumers (API, CMS backend) call it with `{ status, resulted, eventOffTime, suspendAtEventOffTime, eventStartTime }`.

- [ ] **Step 1: Write the failing test**

```ts
// src/tests/utils/events/getSwiftyFeedRacingEventStatus.spec.ts
import { getSwiftyFeedRacingEventStatus } from '../../../utils';
import { EventStatuses, SportEventStatuses } from '../../../common';

describe('getSwiftyFeedRacingEventStatus', () => {
  it('maps the four feed words through EventStatuses.SWIFTY_FEED_RACING', () => {
    expect(EventStatuses.SWIFTY_FEED_RACING).toEqual({
      scheduled: SportEventStatuses.PRE_MATCH,
      in_progress: SportEventStatuses.IN_PLAY,
      completed: SportEventStatuses.FINISHED,
      cancelled: SportEventStatuses.ABANDONED,
    });
  });

  it('returns ABANDONED for cancelled, whatever else is set', () => {
    expect(getSwiftyFeedRacingEventStatus({ status: 'cancelled', resulted: 1, eventOffTime: '2026-10-05 14:00:00' })).toBe(SportEventStatuses.ABANDONED);
  });

  it('returns FINISHED for completed', () => {
    expect(getSwiftyFeedRacingEventStatus({ status: 'completed', eventOffTime: null })).toBe(SportEventStatuses.FINISHED);
  });

  it('returns FINISHED when resulted is set, as number, string or boolean', () => {
    expect(getSwiftyFeedRacingEventStatus({ status: 'in_progress', resulted: 1, eventOffTime: null })).toBe(SportEventStatuses.FINISHED);
    expect(getSwiftyFeedRacingEventStatus({ status: 'in_progress', resulted: '1', eventOffTime: null })).toBe(SportEventStatuses.FINISHED);
    expect(getSwiftyFeedRacingEventStatus({ status: 'scheduled', resulted: true, eventOffTime: null })).toBe(SportEventStatuses.FINISHED);
    expect(getSwiftyFeedRacingEventStatus({ status: 'scheduled', resulted: 0, eventOffTime: null })).toBe(SportEventStatuses.PRE_MATCH);
    expect(getSwiftyFeedRacingEventStatus({ status: 'scheduled', resulted: '0', eventOffTime: null })).toBe(SportEventStatuses.PRE_MATCH);
  });

  it('returns IN_PLAY for in_progress', () => {
    expect(getSwiftyFeedRacingEventStatus({ status: 'in_progress', eventOffTime: null })).toBe(SportEventStatuses.IN_PLAY);
  });

  it('returns IN_PLAY when off_time is set and the race is not finished or cancelled', () => {
    expect(getSwiftyFeedRacingEventStatus({ status: 'scheduled', eventOffTime: '2026-10-05 14:00:00' })).toBe(SportEventStatuses.IN_PLAY);
    expect(getSwiftyFeedRacingEventStatus({ status: null, eventOffTime: '2026-10-05 14:00:00' })).toBe(SportEventStatuses.IN_PLAY);
  });

  it('returns PRE_MATCH for scheduled, null and unknown without an off time', () => {
    expect(getSwiftyFeedRacingEventStatus({ status: 'scheduled', eventOffTime: null })).toBe(SportEventStatuses.PRE_MATCH);
    expect(getSwiftyFeedRacingEventStatus({ status: null, eventOffTime: null })).toBe(SportEventStatuses.PRE_MATCH);
    expect(getSwiftyFeedRacingEventStatus({ status: 'something_new', eventOffTime: null })).toBe(SportEventStatuses.PRE_MATCH);
  });

  it('suspend-at-off: IN_PLAY once the start time has passed, PRE_MATCH before it, PRE_MATCH when the flag is off', () => {
    expect(getSwiftyFeedRacingEventStatus({ status: 'scheduled', eventOffTime: null, eventStartTime: '2020-06-24 10:00:00', suspendAtEventOffTime: true })).toBe(SportEventStatuses.IN_PLAY);
    expect(getSwiftyFeedRacingEventStatus({ status: 'scheduled', eventOffTime: null, eventStartTime: '2099-06-24 10:00:00', suspendAtEventOffTime: true })).toBe(SportEventStatuses.PRE_MATCH);
    expect(getSwiftyFeedRacingEventStatus({ status: 'scheduled', eventOffTime: null, eventStartTime: '2020-06-24 10:00:00', suspendAtEventOffTime: false })).toBe(SportEventStatuses.PRE_MATCH);
  });
});
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx jest src/tests/utils/events/getSwiftyFeedRacingEventStatus.spec.ts`
Expected: FAIL (helper not exported).

- [ ] **Step 3: Implement**

`src/common/constants/eventStatuses.ts`, inside `EventStatuses` after `SWIFTY_FEED`:

```ts
  /** The Swifty feed's racing event words (`racing_events.status`), stored as the feed sends them. */
  SWIFTY_FEED_RACING: {
    scheduled: SportEventStatuses.PRE_MATCH,
    in_progress: SportEventStatuses.IN_PLAY,
    completed: SportEventStatuses.FINISHED,
    cancelled: SportEventStatuses.ABANDONED,
  },
```

`src/common/dto/events/getSwiftyFeedRacingEventStatus.dto.ts`:

```ts
import type { Nullable } from '../../../types';

/**
 * Input for `getSwiftyFeedRacingEventStatus`. Mirrors the RAS DTO: the feed's own status word plus
 * the off time, with the feed's `resulted` flag as a finished short-circuit.
 */
export interface GetSwiftyFeedRacingEventStatusDto {
  /** `racing_events.status`: `scheduled` | `in_progress` | `completed` | `cancelled`, or null. */
  status: Nullable<string>;
  /** `racing_events.resulted`; a tinyint, so `1`, `'1'` or `true` all mean resulted. */
  resulted?: Nullable<boolean | number | string>;
  /** `racing_events.off_time`; any value means the race has gone off. */
  eventOffTime: Nullable<string>;
  suspendAtEventOffTime?: boolean;
  eventStartTime?: Nullable<string>;
}
```

Add `export * from './getSwiftyFeedRacingEventStatus.dto';` to `src/common/dto/events/index.ts`.

`src/utils/events/getSwiftyFeedRacingEventStatus.ts`:

```ts
import moment from 'moment';

import { EventStatuses, SportEventStatuses } from '../../common';
import type { GetSwiftyFeedRacingEventStatusDto } from '../../common';

const isResulted = (value: GetSwiftyFeedRacingEventStatusDto['resulted']): boolean =>
  value === true || value === 1 || value === '1';

/**
 * Platform status of a Swifty feed racing event, from the feed's status word and the off time.
 * Same shape and precedence as `getRasEventStatus`: a terminal word wins, then suspend-at-off,
 * then the in-play word, then the off time, else pre-match.
 *
 * @example
 * ```typescript
 * getSwiftyFeedRacingEventStatus({ status: 'scheduled', eventOffTime: null }); // 'pre_match'
 * getSwiftyFeedRacingEventStatus({ status: 'scheduled', eventOffTime: '2026-10-05 14:02:11' }); // 'in_play'
 * getSwiftyFeedRacingEventStatus({ status: 'in_progress', resulted: 1, eventOffTime: null }); // 'finished'
 * getSwiftyFeedRacingEventStatus({ status: 'cancelled', eventOffTime: null }); // 'abandoned'
 * ```
 */
export const getSwiftyFeedRacingEventStatus = (payload: GetSwiftyFeedRacingEventStatusDto): SportEventStatuses => {
  const { status, resulted, eventOffTime, suspendAtEventOffTime, eventStartTime } = payload;
  const mapped = status ? EventStatuses.SWIFTY_FEED_RACING[status as keyof typeof EventStatuses.SWIFTY_FEED_RACING] : undefined;

  if (mapped === SportEventStatuses.ABANDONED) {
    return SportEventStatuses.ABANDONED;
  }

  if (mapped === SportEventStatuses.FINISHED || isResulted(resulted)) {
    return SportEventStatuses.FINISHED;
  }

  if (suspendAtEventOffTime && eventStartTime) {
    const now = moment();
    const startDate = moment(eventStartTime).utc(true);

    if (now.isAfter(startDate)) {
      return SportEventStatuses.IN_PLAY;
    }
  }

  if (mapped === SportEventStatuses.IN_PLAY) {
    return SportEventStatuses.IN_PLAY;
  }

  if (eventOffTime) {
    return SportEventStatuses.IN_PLAY;
  }

  return SportEventStatuses.PRE_MATCH;
};
```

Add `export * from './getSwiftyFeedRacingEventStatus';` to `src/utils/events/index.ts`. Do NOT touch `getProviderEventStatus` (its `s` case is golf; RAS is not wired there either).

- [ ] **Step 4: Run the test, the suite and the type check**

Run: `npx jest src/tests/utils/events/getSwiftyFeedRacingEventStatus.spec.ts`, `npx jest`, `npx tsc --noEmit`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/common/constants/eventStatuses.ts src/common/dto/events/getSwiftyFeedRacingEventStatus.dto.ts src/common/dto/events/index.ts src/utils/events/getSwiftyFeedRacingEventStatus.ts src/utils/events/index.ts src/tests/utils/events/getSwiftyFeedRacingEventStatus.spec.ts
git commit -m "feat(events): swifty feed racing event status helper"
```

---

### Task 3: Cast void table knows the feed's cancelled race

**Files:**
- Modify: `src/BetCalculator/castConstants.ts` (`ABANDONED_EVENT_STATUSES`)
- Modify: `src/BetCalculator/castCalculator.ts` (the `@param bet_provider` doc line, add `"r" (Swifty feed racing)`)
- Test: `src/tests/BetCalculator/castAbandonedVoid.test.ts`

**Interfaces:**
- Produces: `CastCalculator.shouldVoidCastForAbandonedEvent({ bet_provider: 'r', status: 'cancelled' }) === true`.

- [ ] **Step 1: Add the failing case to the existing test**

In `src/tests/BetCalculator/castAbandonedVoid.test.ts`, extend the voids table with `['r', 'cancelled']` and the not-void table with `['r', 'completed']` and `['r', 'scheduled']`, in the same style as the `h` rows there.

- [ ] **Step 2: Run, expect failure**

Run: `npx jest src/tests/BetCalculator/castAbandonedVoid.test.ts`
Expected: FAIL on the `r` rows.

- [ ] **Step 3: Add the entry**

In `castConstants.ts`, `ABANDONED_EVENT_STATUSES` gains `r: ['cancelled']` next to `h: ['ABANDONED']`, with a one-line comment: `// Swifty feed racing: the feed's own word for an abandoned race.`

- [ ] **Step 4: Run the suite**

Run: `npx jest` and `npx tsc --noEmit`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/BetCalculator/castConstants.ts src/BetCalculator/castCalculator.ts src/tests/BetCalculator/castAbandonedVoid.test.ts
git commit -m "feat(casts): void casts on a cancelled swifty feed race"
```

---

### Task 4: Version 1.0.151, build, lint

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Bump**

`package.json` `"version": "1.0.151"`; `package-lock.json`: both `"version": "1.0.150"` occurrences at the top (line 3 and under `"packages": { "": {`) become `1.0.151`. Verify with `grep -n '"version": "1.0.15' package.json package-lock.json | head -4`.

- [ ] **Step 2: Gates**

Run: `npm run build` (must leave `dist/` populated for the other repos' symlink farm), `npx eslint src/common/constants/providerPrefixes.ts src/common/constants/eventStatuses.ts src/utils/events/getSwiftyFeedRacingEventStatus.ts src/common/dto/events/getSwiftyFeedRacingEventStatus.dto.ts src/BetCalculator/castConstants.ts`, `npx jest`.
Expected: build exit 0, no new lint problems in those files, jest green.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(release): 1.0.151"
```

- [ ] **Step 4: Report** the commit list (`git log --oneline origin/master..HEAD`) and `git status --short` (must be empty; `node_modules` must not appear).
