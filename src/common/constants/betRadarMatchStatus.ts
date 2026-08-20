/**
 * Betradar `match_status` -> human-readable phase label, per sport.
 *
 * `match_status` is the period-level phase code on `sport_event_status`, distinct from `status`
 * (which is the event-level lifecycle: not started / live / ended / …, see EventStatuses.BET_RADAR).
 * It is what turns "In-Play" into "2nd Set" or "1st Half".
 *
 * WHERE THIS MAPPING COMES FROM
 *
 * Betradar publishes a match_status description list, but our REST proxy (api.swnet.work) does
 * not expose the `/descriptions/` endpoints — they answer `Cannot GET`. So rather than transcribe
 * codes from memory into punter-facing strings, this table was DERIVED from our own feed data.
 *
 * Every `period_scores.period_score` entry carries both a `number` (which period/set it is) and
 * the `match_status_code` that was current during it. Aggregating those pairs over 11,748 prod
 * events on 2026-08-20 gave an exact, unambiguous mapping — every code resolved to exactly one
 * period number, with no conflicts:
 *
 *   soccer        6 -> period 1 (n=5004)   7 -> period 2 (n=4759)
 *   basketball   13 -> period 1 (n=1602)  14 -> period 2 (n=1590)
 *                15 -> period 3 (n=1551)  16 -> period 4 (n=1542)
 *   icehockey     1 -> period 1 (n=476)    2 -> period 2 (n=473)    3 -> period 3 (n=469)
 *   tennis        8 -> period 1 (n=1650)   9 -> period 2 (n=1643)  10 -> period 3 (n=574)
 *                11 -> period 4 (n=21)    12 -> period 5 (n=6)
 *   tabletennis   8 -> period 1 (n=82)     9 -> period 2 (n=78)    10 -> period 3 (n=77)
 *                11 -> period 4 (n=54)    12 -> period 5 (n=32)
 *
 * DELIBERATELY INCOMPLETE
 *
 * Codes that never appear inside `period_scores` cannot be derived this way, because they are not
 * periods — they are interstitial or terminal states (half-time, extra time, penalties, and so
 * on). Seen live on prod but NOT included here: soccer 31/34/42, tennis 100, basketball 302,
 * icehockey 301/302, volleyball 304, darts 21, baseball 411, and code 0 across several sports.
 *
 * Guessing labels for those would put invented text in front of punters, so they are omitted and
 * `getBetRadarEventStatus` falls back to the event-level status label ("In-Play") instead. That
 * covered roughly 89% of live events carrying a phase code at the time of writing. Add entries
 * here only with evidence — either a Betradar description list, or the same period_scores
 * derivation once those codes are observed inside a period.
 *
 * HANDBALL AND VOLLEYBALL are included by structural analogy, not derivation: neither appeared in
 * the period_scores sample. Handball's live codes on prod are exactly soccer's (6, 7, 31) and the
 * sport has two halves; volleyball's are exactly tennis's (8-11) and the sport is played in sets.
 * Both are flagged here so a future reader knows they rest on weaker evidence than the rest.
 */
export const BetRadarMatchStatusPhases: Record<string, Record<string, string>> = {
  soccer: {
    '6': '1st Half',
    '7': '2nd Half',
  },
  // Structural analogy with soccer — see note above.
  handball: {
    '6': '1st Half',
    '7': '2nd Half',
  },
  basketball: {
    '13': '1st Quarter',
    '14': '2nd Quarter',
    '15': '3rd Quarter',
    '16': '4th Quarter',
  },
  icehockey: {
    '1': '1st Period',
    '2': '2nd Period',
    '3': '3rd Period',
  },
  tennis: {
    '8': '1st Set',
    '9': '2nd Set',
    '10': '3rd Set',
    '11': '4th Set',
    '12': '5th Set',
  },
  tabletennis: {
    '8': '1st Set',
    '9': '2nd Set',
    '10': '3rd Set',
    '11': '4th Set',
    '12': '5th Set',
  },
  // Structural analogy with tennis — see note above.
  volleyball: {
    '8': '1st Set',
    '9': '2nd Set',
    '10': '3rd Set',
    '11': '4th Set',
    '12': '5th Set',
  },
};

/**
 * Resolves a Betradar phase label, or null when the code is not one we can name for that sport.
 *
 * Returns null rather than a placeholder so callers can fall back to the event-level status label
 * — an unnamed code must never surface as invented text.
 */
export const getBetRadarMatchStatusPhase = (
  sportSlug?: string | null,
  matchStatus?: string | number | null,
): string | null => {
  if (!sportSlug || matchStatus === undefined || matchStatus === null || matchStatus === '') {
    return null;
  }

  return BetRadarMatchStatusPhases[sportSlug]?.[String(matchStatus)] ?? null;
};
