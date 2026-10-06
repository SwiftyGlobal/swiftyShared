# Ticket 6054: Swifty feed horse racing on the platform, the RAS way

Ticket: 6054. Card: https://trello.com/c/pn8IpPWw (Swifty Platform board). Written 2026-10-05, revised the same
day for the racing provider letter. Consumer side is ticket 6047 (SwiftyFeed PRs #67/#68) plus the consumer
changes handed off to the SwiftyFeed session (a workspace handoff note, not in any repo).

## 1. Problem

The SwiftyFeed consumer writes the feed's horse racing into nine `racing_*` tables in the feed
database, shaped after the RAS racing database. Nothing on the platform reads them: no racecard,
no betslip, no settlement, no CMS view. The platform already integrates three racing providers by
a one-letter prefix (`c` SIS, `d` PA Media, `h` RAS); every racing surface dispatches on that
letter. This ticket adds the feed's racing as the fourth racing provider, letter `r`, mirroring
the RAS code path by path, and lists what RAS has that does not apply.

## 2. Decisions (the user's, 2026-10-05)

1. Silks are downloaded to our CDN like SIS, PA and RAS: one source of truth. The feed's tables
   gain the platform-owned tracking columns the RAS consumer added for the worker.
2. The event status map lives in `@swiftyglobal/swifty-shared` (1.0.151). The user publishes it.
3. `racing_markets.swifty_market_id` is NOT stamped: racing code uses the constant win market id
   `c1`, as it does for RAS, and nothing reads the column. It stays NULL.
4. Communication applies the early-price gate to the feed's racing frames (stricter than RAS,
   whose frames are not gated there).
5. Racing from the feed is its own provider, letter `r`, slug `swifty-feed-racing`. Golf stays
   `s`. The consumer publishes racing with `r` (handoff above). This replaces the earlier plan to
   tell golf and racing apart by the bet's sport slug: no platform path that reads `s` as golf is
   touched.

## 3. Identity rules (what every repo agrees on)

- Provider letter `r`, slug `swifty-feed-racing`, its own `provider_details` row and CMS
  `providers` row (seeded, section 4.5). Suspending it never touches golf.
- Event id `r-{event_id}`, selection id `r-{event_id}-{selection_no}`, meeting `r-{meeting_id}`.
  Raw ids are strings. Runners without a cloth number (`selection_no IS NULL`) have no id and are
  excluded from every read (`WHERE selection_no IS NOT NULL`).
- Bets: `user_bets_single.bet_provider = 'r'`, `placed_selection.provider = 'r'`, exactly as `h`.
- Win market id `c1` (the racing win market on every provider). No other market exists.
- Sport slug from `category_code`, as for RAS: `HR` -> `horseracing`, `DG` -> `greyhoundracing`.
  Today the feed sends only `HR` (`meeting_type` `R`), but every platform read keys on the
  category and the meeting type, never on a hard-coded horse-racing value, so a future
  greyhound feed needs consumer work only (its own queue, `DG` / `G`, the greyhound slug).
- The feed database and its pools are shared with golf (`swifty_feed` in the API, `sf` in the
  CMS backend, `global.dbSFPoolReader` / `global.dbSFPool` in the settler and the worker). The
  letter names the provider, not the database.
- Race competition id, ONE expression used by every repo, in SQL or its exact JS twin:
  `LOWER(REPLACE(CONCAT(IF(M.country = 'GB', 'UK', M.country), '_', M.meeting_venue), ' ', '_'))`.
  The feed's `country` is ISO-2 (`GB`, `IE` in the real bodies); the platform's venue ids and
  `race_competitions.country_code` use `UK` for Great Britain (what the SIS, PA and RAS seeders
  write), so `GB` is mapped to `UK` everywhere the id or the country code is built: the settler's
  seeder, the API's listing and betslip rows (`event_country` is projected already mapped so
  `buildRacingCompetitionId` agrees), the CMS backend's competition lookups. No RAS-style
  canonicalisation or alias table for `r`: the feed's venue names are stored as they come.
  `race_competitions` rows: `provider_prefix 'r'`, `sport_slug` from `meeting_type`,
  `competition_name` = `meeting_venue` (raw; Communication keys early-price gating on it).
- A meeting covered by another racing provider too: the settler's duplicate-exclusion ranking
  (`ExcludeDuplicateRaceCompetitions.js`, RAS then PA then SIS) puts `r` LAST, so an existing
  provider's card wins and the feed's row is disabled. Trading can reorder later.
- Prices: `mkt_type` `E` early, `B` boarding, `S` starting price; `current_price_decimal` /
  `current_price_fractional` null until a numeric price exists; `starting_price` the SP;
  `price_history` json in the RAS shape; `favorite_status` `fav` / `joint_fav`; `scratched` the
  non-runner flag; `finish_position`; `places_expected` / `place_fraction` the each-way terms
  (`ew_terms` is `1/{place_fraction}`); `no_runners` / `active_runners`; `handicap` the feed's
  real value (RAS hard-codes `N`; the feed has the column, so it is used).
- Event status, the feed vocabulary in `racing_events.status`, mapped by the shared helper
  (section 4.1): `cancelled` -> abandoned; `completed` or `resulted = 1` -> finished;
  `in_progress`, or `off_time` set, or suspend-at-off past the start -> in_play; `scheduled` or
  null -> pre_match. Official result: `racing_results.result_type = 'RESULT'` (else `INTERIM`).
- Silk URL: `{cdn}/r/silk/png/{event_id}-{selection_no}.png`, built from the selection id as RAS
  does, served regardless of the download flag (a missing object renders blank, as RAS).
- Timestream: the feed writes `P = '7'` with `T` 1 early, 2 boarding, 3 SP, 4 non-runner, 6
  finished, 7 position; golf rows carry no `T`. The CMS reads a bet's rows by its provider
  letter, so `r` bets get the racing labels and `s` bets stay golf.

## 4. Repos and what changes

### 4.1 swiftyShared (master, publish 1.0.151)

- `src/common/constants/providerPrefixes.ts`: `Providers.SWIFTY_FEED_RACING = 'swifty-feed-racing'`,
  `ProviderPrefixes.r`, `FeedProviders.SWIFTY_FEED_RACING = 'r'`, `FeedProvidersNames.r`
  ("Swifty Feed Racing"). `SportProviders` follows from the prefix keys.
- `src/common/constants/eventStatuses.ts`: `EventStatuses.SWIFTY_FEED_RACING` maps the four feed
  strings to `SportEventStatuses`.
- `src/common/dto/events/getSwiftyFeedRacingEventStatus.dto.ts`: `{ status, resulted?,
  eventOffTime, suspendAtEventOffTime?, eventStartTime? }`, exported from the dto index.
- `src/utils/events/getSwiftyFeedRacingEventStatus.ts`: the RAS helper's structure
  (`getRasEventStatus`) with the feed sets, the `resulted` short-circuit to finished, and the same
  off-time and suspend-at-off handling. Exported from the utils index. NOT wired into
  `getProviderEventStatus` (RAS is not either); racing surfaces call it directly.
- Tests `src/tests/utils/events/getSwiftyFeedRacingEventStatus.spec.ts`: every status, the
  resulted flag, off-time, suspend-at-off before and after start, null status; the provider
  registry test, if one exists, gains `r`.
- Version 1.0.151 in `package.json` and both spots in `package-lock.json` (house rule). Branch
  `feat/6054-swifty-feed-racing-provider`.

### 4.2 SwiftyFeed (main and dev, on the open 6047 PRs; handed off)

- The racing publisher sends provider `r` and `r-` ids; golf is unchanged.
- Platform-owned silk tracking, mirroring the RAS consumer's `AddSilkDownloadedToSelections`
  migration: `racing_selections.silk_downloaded` TINYINT(1) NOT NULL DEFAULT 0 (entity, migration,
  excluded from the snapshot's full replace) and `racing_download_silk_images` (`silk_name`
  varchar(80) UNIQUE, `silk_url`, `created_at`). Prod gets both through the CEO schema sync.

### 4.3 swifty-providers-worker (main)

- `models/swifty_feed/SFRacingSilkDownloader.js`, log token `SFR-SD`, registered every minute
  next to `RASSilkDownloader`. Returns at once when `database_swifty_feed_name` is unset or the
  pools are missing. Selects up to 300 rows `WHERE silk_downloaded = 0 AND selection_no IS NOT NULL
  AND (silk_path IS NOT NULL OR silk_url IS NOT NULL)` through `global.dbSFPoolReader`; a row with
  neither source is left at 0 and simply never selected (the consumer keeps the flag across
  snapshots, so flipping it early would freeze a runner whose silk arrives in a later snapshot).
  Dedups against
  `racing_download_silk_images`. Downloads `silk_path` first, `silk_url` on failure; converts to
  PNG with the worker's sharp service (the SIS downloader does; the feed's images are GIF or PNG);
  uploads with `s3UploadCDN` to `r/silk/png/{selection_id}.png`; inserts the dedup row and flips
  the flag through `global.dbSFPool`. The RAS 4xx rules (408/429 retry, other 4xx flag and skip)
  carry over.
- No market id stamping (decision 3). `SFUpdateMarketId` is untouched.
- `test/`: a unit test on the candidate query and the flag rules with the pools mocked.

### 4.4 swiftyPredictionsELBAPI (stg-release/1.35 and a dev twin)

Constants, `constant/SwiftyFeedRacing.js`: `SFR_BET_PROVIDER = 'r'`, `SFR_PREFIX = 'r-'`,
`SFR_MAIN_MARKET_ID = 'c1'`, `SFR_PROVIDER_SLUG = 'swifty-feed-racing'`, `SFR_FINAL_EVENT`
(status `completed` or `resulted = 1`), `SFR_VOID_EVENT_STATUSES = ['cancelled']`, the selection
status vocabulary reused from RAS (`RasSelectionStatus`).

Provider service, `service/sfRacing.service.js`: every method of `service/ras.service.js` with
the table prefix swapped (`racing_events`, `racing_selections`, `racing_results`,
`racing_dividends`, `racing_meetings`), `r-` stripped, `global.dbSFPoolReader` as the pool, the
feed status rules from section 3, the `active_runners` loser-versus-void tiebreak, dividends by
bet type exactly as RAS maps them (forecast `CSF`, exacta `EXA`, tricast `TRCT`, trifecta `TRI`)
with the runner number after the last `-` of the selection id.

Starting price for `r`, stricter than RAS: a selection's SP is returned only once the result is
official (`racing_events.result_final = 1`, or a `racing_results` row of type `RESULT` for it);
before that the SP lookup returns false and the bet waits. RAS pays winners at INTERIM because
trading confirmed a RAS SP never changes once sent; there is no such evidence for this feed yet.
Losers still settle at INTERIM from finish positions. (Decision open for the user: flip to RAS
parity by dropping the `result_final` gate.)

Jobs, `models/swifty_feed_racing/`, each returning early when the feed DB is unset:

- `SFREventUpdateStatus.js` (`SFR_UCS`): open `r` singles and legs whose event is final
  (`completed` or `resulted`), flip `event_finished`, backfill `ew_places` / `ew_terms` only when
  the bet has none (RAS rule).
- `SFREventAbandoned.js`: events in `cancelled`; push the legs and flag the singles as RAS does.
- `SFRSPOddsUpdate.js` (`SFR_SP_OU`): `starting_price` onto `sp_odd`, fallback `racing_results`.
- `SFRUpdateDeadhead.js` (`SFR_UDH`): `placed_selection` rows `provider = 'r'`, finish position
  and the per-position count from `racing_selections`, custom positions honoured.
- Stale-feed check: not added (section 5).

Shared racing paths gain the provider, exactly as `h` was added:

- `service/racing.service.js`: the singles filter becomes `bet_provider IN ('c','d','h','r')`;
  every `bet_provider == 'h'` branch gets an `'r'` sibling calling `sfRacingService`.
- `models/resultEW.js` (the each-way settler: its filter and six `h` branches),
  `service/racingLateBet.utils.js` (`RACING_PROVIDERS` and an `r` branch reading
  `racing_events.off_time` like the `h` one; without it `r` legs skip the late-bet guard),
  `models/resultPlacedSelection.js`, `models/EMUpdateUpcomingEventResult.js`, `models/ECS.js`,
  `models/ExcludeDuplicateRaceCompetitions.js` (`r` last in the priority): each `h` site gets its
  `r` sibling. The inventory rule for the settler: `rg -n "'h'|\"h\"|h-|rasService" models service lib`
  and every hit is either given an `r` twin or listed in the PR body as not applicable (derivative
  markets, the Tattersalls comment, RAS-specific slug canonicalisation).
- `models/resultPreRaceNonRunners.js`, `models/resultRaceWinnerNoTx.js`, `models/resultCasts.js`
  (the RAS cast branch gets an `r` sibling using the feed service's `getCastPayout`),
  `models/playbookResultMultiples.js` (`isRacingProvider` includes `r`; the `h` branch gets an
  `r` sibling), `service/settlement.utils.js` (SP lookup).
- `models/UnnamedFavoriteSpOddsUpdate.js` and `lib/unnamedFavorite.js`: `PROVIDER_CONFIG.r`
  (`dbSFPoolReader`, `event_id`, `selection_id`, `starting_price`, `selection_name`, `scratched = 0`)
  plus a `table` key (`racing_selections`) that the two queries use, defaulting to `selections`.
- Every feed read inside a shared step (Rule 4, the competitions seeder, the reserve-swap job) is
  wrapped in its own try/catch that logs once and yields nothing, so a missing `racing_*` table on
  an environment that has not had the schema sync never aborts the other providers' work.
- `models/Rule4Recalculation.js`: a feed branch reading `racing_nonrunners_history` by
  `id > settings_v2.swifty_feed_racing_check_nonrunners_last_id` through the feed reader pool,
  mirroring rows into `race_nonrunners_history` with `bet_provider 'r'`, the RAS deduction
  normalisation (integer percent or fraction), cursor saved before the early return. A missing
  cursor setting or an unset feed DB SKIPS the feed branch with one log line; it never throws, so
  PA, SIS and RAS Rule 4 keep running on an environment where the seed has not landed.
- `models/addRaceCompetitions.js`: `getSFRacingEvents` reads `racing_meetings` (distinct
  `country`, `meeting_venue`, `meeting_type` in `R`, `G`, mapped to the sport slug as RAS does) through the feed reader pool, gated by
  `isProviderActive('r')` (the CMS providers row), formatted with the RAS canonicaliser,
  collected under prefix `r`.
- `controllers/cron_jobs.js`: `SFREventUpdateStatus` after `RASEventUpdateStatus`,
  `SFRSPOddsUpdate` after `RASSPOddsUpdate`, `SFRUpdateDeadhead` after `RASUpdateDeadhead` in
  `settlementSteps`; `SFREventAbandoned` in the ten-minute block; all under `RACING_ENABLED`.
- The golf settler (`EMPlaybookSingleResult`) and golf leg resulter (`SFUpdateSelectionResult`)
  are untouched: they select `s`, racing is `r`.
- Tests under `tests/swifty_feed_racing/`: twins of the RAS event-update and SP tests, the Rule 4
  feed branch (cursor save, deduction normalisation, missing-setting skip), the seeder branch, the
  singles filter (an `r` single is selected, an `s` single is not).

### 4.5 SwiftyPredictionsCMSEB (stg-release/1.35 and a dev twin)

- Two seed migrations. CMS DB (`.sql`, guarded on the slug like golf's): the `providers` row
  (`swifty-feed-racing`, prefix `r`, name "Swifty Feed Racing", `enabled_sports ["horseracing"]`)
  with **status 0**: the racecard, widgets and market options read that status, so the provider
  stays off on every environment until a trader switches it on in the CMS provider screen, brand
  by brand. Main DB (`.js`, guarded on `database_swifty_feed_name` like the RAS seed): the
  `provider_details` row (`swifty-feed-racing`, suspendAll 0, warningTime 300) and the
  `settings_v2` Rule 4 cursor. Both DOWNs are empty by the seeds' convention; removal by hand is
  described in 6b. The sport-provider chain lists sports providers only; racing is not in it.
- `src/constants/providerTypes.js`: `SWIFTY_FEED_RACING: "r"`; `RACING_PROVIDER_PREFIXES` gains it.
- `src/controllers/settings/providers/getProviderStatus.js` (and its update twin): the slug in
  `SYNTHETIC_PROVIDER_SLUGS`, the display name map and the default warning time.
- `src/constants/providerRawTables.js`: a `sfr` provider over connection `sf` listing the nine
  racing tables, `overlayPrefix 'r'`, module flag `module_enable_racing`.
- `src/controllers/trading/Positions/getEventPositions.js`: a `SWIFTY_FEED_RACING` case next to
  RAS (selections, finish positions, scratched, silk URL from the selection id, dividends from
  `racing_dividends` for forecast and tricast).
- `src/services/Trading/trading-market-selection.service.js`, `nonRunner.service.js`,
  `placed-bets.service.js`: the RAS cases and branches gain `r` siblings (placed bets resolved
  with the out-of-range finish position sentinel rule).
- `src/services/Events/events.service.js` and `src/services/Matches/matches.service.js`: `r`
  twins of the RAS event list and event detail readers, with the feed vocabulary for the
  upcoming, live, finished and abandoned filters, `isProviderSuspended('swifty-feed-racing')`.
- `src/services/Telebet/telebet.service.js`, `GetTelebetCompetitionsData.js`, both
  `getTelebetMatchData` controllers, `postSaveTradingMarket.js`,
  `addManualMarketSelectionToEvent.js`, `competitions.service.js`: `r` joins the racing prefix
  checks and sets.
- `src/routes/priceFeed.routes.js` and `src/class/awsTimeStream.js`: provider `r` reads `P = '7'`
  rows and decodes `T` with the RAS price-type labels (`getSwiftyFeedRacingBetData`); the golf
  reader is untouched.
- The rest of the RAS inventory in the CMS backend, each site given its `r` twin: venue settings
  (`trading/editCompetition.js`), trading markets and the four market-selection controllers
  (`Markets/getTradingMarkets.js`, `MarketSelections/*`), manual resulting
  (`Positions/saveEventPositions.js`), liabilities (`trading/eventLiabilities.js`), telebet v2
  (`getTelebetRacingContent.js`, `getRasCompetitionsDataV2`), the competition and country
  screens (`sports/competitions.js`, `trading/competitions/*`, `getCountries.js`,
  `orderCountries.js`), events (`getEventOptions.js`, `getEventMatches.js`, `editEventMatches.js`,
  `Results/getTradingResult.js`), and `Markets/market.service.js` (the `unique_selection_id`
  prefix map gains `swifty-feed-racing` -> `r`). Inventory rule: `rg -n "providerTypes.RAS|\"h\"|'h'|h-" src`
  and every hit is twinned or listed as not applicable in the PR body.
- `src/configs/dbSF.config.js`: `connectionLimit` from 1 to 5, since racing reads now share the
  feed pool with golf (RAS has its own pool of 5).
- Tests: the positions and placed-bets readers with a feed racing fixture, the Timestream label
  decode, the migration load check. Lint compared against the base's pre-existing failures.

### 4.6 SwiftyGamingBackend (stg-release/1.35 and a dev twin)

- `src/services/racing/swiftyFeedRacing.service.ts`: the RAS service mirrored (`getEvents`,
  `getEventsSelections`, `getVenueEvents`, `getEventData`, `searchEventsByName`,
  `getSuspendGlobalStatus` for `swifty-feed-racing`, `getSilkImageUrl` under `r/silk/png`,
  `getMarketOptions`, `getPageLayoutSelections`, `getSelectionDetails`, `getSportSlugs`,
  `getSportSlugsByEventIds`), reading the `swifty_feed` pool, projecting the feed's status into
  the API's `PreMatch` / `PostMatch` phase (`in_progress`, `completed`, or `resulted`), `handicap`
  from the column, runner stats null.
- `src/services/racing/racing.service.ts`: the fourth provider at every dispatch (events,
  selections, venue events, widget, market options, event data, selection details, silk image,
  global suspend status), gated by `providers['swifty-feed-racing']?.status`; event status
  through the shared helper; `showStream` stays false.
- Betslip, `src/utils/betSlip.utils.ts`: `getSelectionRowForSwiftyFeedRacing` next to
  `getSelectionRowForRas` (`c1`, `bet_provider 'r'`, `sport_slug 'horseracing'`, competition id
  by the slug rule, `price_type` from `mkt_type`, `event_resulted`, status through the shared
  helper); the `r` routing, event and selection filters and the provider `case 'r'` branches,
  each a sibling of the `h` ones. `selectionValidator.ts`, `resolveRacingSelectionSuspension.ts`,
  `racing.service.ts` status branches: `r` next to `h`. Early price limits `ep_max_bet` /
  `ep_max_win` and the `E` + early-price-off -> SP rule as RAS.
- `src/services/cashOut.service.ts`: the RAS status reads and price refresh get `r` siblings;
  `isRacingCompetition` accepts `r-`.
- The rest of the RAS inventory in the API, each site given its `r` twin: `helpers/bets.ts`
  (`rawBetId`), `helpers/stripProviderPrefix.ts`, `betSlips.service.ts` (the SP lookup list, the
  each-way lookup, the `swifty_market_id` fall-through that would throw `1082`, the market-status
  override sites, the CMS venue rename), `betSlip.utils.ts` (`eventDates()` for `event_started`
  and the race-competition vetoes, `getEventsRowForSIS` for unnamed favourites, the competition
  snapshot), `racing.service.ts` (the racecard global-suspend chain at ~1291), `bet.service.ts`
  (My Bets Rule 4 display), `liabilityChecker.service.ts` (multiple-leg id parsing, which would
  truncate `r-1996-4` to `1996`), `matches.service.ts` (racing search). Inventory rule:
  `rg -n "'h'|\"h\"|'h-'|Providers.RAS|RAS_PROVIDER|rasService" src` and every hit is twinned or
  listed as not applicable in the PR body (derivative markets, RAS stats view, slug aliases).
- The feed connection is taken with `getOptionalConnection('swifty_feed')`; when it is absent
  (a brand without the feed DB) every method of the new service returns empty and the service
  logs once, so a racing-only brand never crashes at start-up.
- `dbs.service.ts`: the feed reader pool's `connectionLimit` from 2 to 5 (shared with golf now).
- `sports.service.ts`: the new lines use `startsWith('r-')`, not `includes` (a golf id can contain
  `r-` inside its option key).
- `src/services/sports.service.ts`: `r` bet and event ids resolve their slug through the new
  service, next to the RAS lines. The golf lines are untouched.
- `src/services/matches.service.ts`, `selections.service.ts`: the RAS cases get `r` siblings.
- `src/middlewares/checkProxy.middleware.ts`: `sf_racing_silk_image = {cdn}/r/silk/png`.
- `docs/swagger.yaml`: `provider_slug` values list `r` where enumerated.
- Tests under `test/racing/`: feed racing twins of favourite marker, racing class, cast
  availability and suspension; the betslip row loader; the sport slug lookup.

### 4.7 SwiftyGamingCommunication (stg-release/1.35 and a dev twin)

- `src/services/socket-subscriptions.service.ts`: `isRace` is `c`, `d` or `r`; the market status
  override rule includes `r`. Race competitions key `{provider}-{venue}` as today.
- The `SportProviders` type comes from the shared package. Either bump to 1.0.151 (check what
  else the jump from 1.0.135 drags in, in particular the EveryMatrix status change past 1.0.145)
  or widen the parameter type locally. Decided in the plan after that check.
- Tests in the selections suite: an `r` `E` frame on a venue with early prices off is dropped; a
  `B` frame passes; a golf `s` frame is unaffected.

### 4.8 Not changed, verified

- **SwiftyGamingFront.** Silks come from the API; the stats view keys on the RAS prefix only;
  leg correlation scopes golf only when the id has a colon; search routes by sport slug; live
  selection ids are built from the API's provider prefix. Checked again against a real racecard
  response at verification.
- **SwiftyPredictionsCMSWebsite** is IN the set after all (section 4.9).

### 4.9 SwiftyPredictionsCMSWebsite (stg-release/1.35 and a dev twin)

- `src/utils/providersUtils.js`: the local `ProviderPrefixes` map gains `r` (label
  `SWIFTY_FEED_RACING`, in the file's upper-case label style; only the keys are load-bearing), so
  counter-offer and referral legs have their `r-` prefix stripped like every other provider's (the
  5905 bug class), and `src/utils/__tests__/providersUtils.test.js` gains the `r` row.
- The last block of that test is a drift test: it imports `@swiftyglobal/swifty-shared` and requires
  the local letters to equal the shared ones exactly. So the website moves to the new shared version
  with the other consumers: `package.json` pins `@swiftyglobal/swifty-shared` at `^1.0.151`
  (`package.json` only; `pnpm-lock.yaml` is refreshed after the publish, section 6). Until then the
  drift test fails against the installed 1.0.145 and passes against the 1.0.151 build; the gate
  evidence names both runs. The test's logic is not weakened to let `r` run ahead of the package.
- Nothing else: the website renders whatever the backend lists.

## 5. Not applicable, with reasons

- Derivative markets (`rasDerivatives.service.ts`, `RASDerivativeSingleResult.js`, c12 to c18):
  the feed sends one win market.
- Stale-feed check on `hr_latest_message`: heartbeats are dev-only. With its own provider row a
  racing check can be added later without touching golf.
- CMS content-panel columns (`cp_*`): nothing in platform or providers reads or writes them.
- Market id stamping: decision 3.
- `RacingCheckEventStartTime`, `BogOddsUpdate`, `SpOddsUpdate`: PA and SIS only; RAS is not in
  them either.
- Runner stats, ratings, comments, speed maps, Japan feed, price boost: no feed source.

## 6. Deploy order

1. swiftyShared 1.0.151 published (the user), then `npm install` in the API, settler and CMS
   backend branches and `pnpm install` in the CMS website branch to refresh their lock files (the
   Dockerfiles run `npm ci` / a frozen pnpm install; a lock pinned at an older version fails the
   build). Those four PRs do not merge before that commit exists.
2. SwiftyFeed: migration on each feed DB (dev `migration:run`; prod CEO sync), then the consumer
   (publishes `r`).
3. CMSEB (its startup seeds the provider rows, off, and the cursor), CMSWebsite, ELBAPI, worker.
4. Gaming Backend.
5. Communication (until it ships, `r` early-price frames reach racing pages ungated, as RAS's do
   today).
6. A trader enables "Swifty Feed Racing" in the CMS provider screen, per brand, once the feed
   tables exist on that brand's feed DB.

Every new job returns early where the feed DB is unset. A missing `racing_*` table (staging reads
`swifty_feed_prod`, which gets the tables only with the CEO sync) fails only the feed's own read:
the standalone jobs catch their own tick, and the feed branches inside shared steps and the API's
and CMS's `Promise.all` fan-outs are each wrapped so the other providers keep working. Nothing
shows on dev until the user adds the racing topics on the adapter (6047's sequence; the user owns
that step).

## 6a. Migrations

- CMS backend (its startup runner): the CMS providers row (`swifty-feed-racing`, prefix `r`,
  `["horseracing"]`), the main `provider_details` row and the `settings_v2` Rule 4 cursor, both
  main-DB inserts guarded on `database_swifty_feed_name` so a brand without the feed DB skips them.
- SwiftyFeed (TypeORM, handed off): `racing_selections.silk_downloaded` and
  `racing_download_silk_images`; dev by `migration:run`, prod by the CEO schema sync.
- No migration anywhere else. No column or table is dropped or altered.

## 6b. Rollback

- Each repo reverts independently; none of the changes alters an existing row or column. Reverting
  the API hides `r` races; reverting the settler leaves `r` bets open (a trader settles by hand);
  reverting the CMS backend hides the provider from the back office but leaves its rows; reverting
  Communication stops gating `r` frames; reverting the worker stops silk downloads (CDN objects stay).
- The seed rows are left in place on a revert (the migrations' DOWN is empty, by the same rule as the
  RAS and golf seeds); to remove the provider by hand: delete the CMS providers row, the
  provider_details row and the settings_v2 cursor.
- The shared package is additive; a consumer can stay on 1.0.151 after a revert.

## 7. Verification on staging and dev (after racing rows exist)

Staging reads the production feed database, which has no racing rows until the feed team's
racing topics are added on prod and the CEO schema sync has run; until then the checks below run on
dev (the 6047 consumer spec, section 8, in the SwiftyFeed PRs, for the feed side). Access to the databases is read-only; placing the test bets and switching the provider happen through the sites.

- The CMS providers list shows "Swifty Feed Racing" off; switching it on shows the races; the
  provider can be suspended without touching golf.
- `race_competitions` has `r` rows for every racing meeting, none for golf, and a GB venue's row
  reads `uk_<venue>`; turning its early prices off in the venue settings screen turns the API's
  early prices to SP for that venue (this proves the id rule end to end).
- Racecard and meetings list show `r-` races with E, B and SP prices, favourite markers,
  non-runners, each-way terms, silks from the CDN.
- A single, an each-way and a forecast are placed on an `r-` race; the slip shows the right
  terms; cash-out quotes.
- After the result: `event_finished`, `sp_odd`, dead heat partial percent, Rule 4 deduction on a
  scratched runner, forecast paid from the dividend.
- CMS: positions, trading, telebet and liabilities show the race; the price audit labels early,
  boarding, SP, non-runner, finished and position rows.
- Socket: an early-price frame on a venue with early prices off is not delivered (probe with the
  shared socket recipe: the handshake must carry `platform`).
- Dead heat, Rule 4 and dividends need such an event in the window; otherwise they are proven by
  the settler's test fixtures (the settler plan, swiftyPredictionsELBAPI) and checked on the first real occurrence.
- Golf regression: the golf settler suites pass unchanged and a golf frame still delivers;
  nothing golf-side was edited (the diff proves it).

## 8. Risks

- A brand without the feed DB skips the seeds (the RAS seed's guard), so the provider never
  appears there; if the feed DB is added later the rows are inserted by hand, as for RAS.
- If a venue name canonicalises differently from RAS's name for the same course, the CMS shows
  two courses; that is data, not code, and is left to trading.
- Runners without a cloth number never appear anywhere (no id). The consumer warns once per apply.
- Greyhounds, if the feed adds them: a venue that runs both codes under one name collides on the
  competition slug (the RAS Galway case; the API withholds collided keys since 5912, the CMS and
  settler alias tables lack the `_dg` suffix for RAS too). Handle with the alias rule when it
  happens; seed the greyhound sport-chain rows then as well.
