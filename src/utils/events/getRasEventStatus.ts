import moment from 'moment';

import { SportEventStatuses } from '../../common';
import type { GetRasEventStatusDto } from '../../common';

/**
 * RAS wire-format event statuses, per the RAS Consumer
 * `Field Definitions - Product Integration.pdf` § Status table.
 *
 * Grouped by the unified `SportEventStatuses` they map to. Every value RAS sends
 * on the Status / Results feed is written verbatim into `events.status` by
 * SwiftyRas (no enum filter on the writer side), so this mapping must be
 * exhaustive over the documented enum.
 */

// Terminal: race or meeting did not run.
const abandonedStatuses = new Set(['ABANDONED']);

// Race is over and the result is final.
//   RESULT             — official result published.
//   PROTEST_UPHELD     — interim result overturned, now official.
//   PROTEST_DISMISSED  — interim result stands, now official.
const finishedStatuses = new Set(['RESULT', 'PROTEST_UPHELD', 'PROTEST_DISMISSED']);

// Betting market is explicitly halted.
const suspendedStatuses = new Set(['SUSPENDED']);

// Race is underway or has finished but the official result hasn't landed yet.
// Selections must not be settleable here, so we treat them as IN_PLAY:
//   CLOSE        — betting closed, race underway.
//   FALSE_START  — race delayed by a false start.
//   FINISHED     — race has crossed the line, awaiting result.
//   RESULTING    — awaiting unofficial results.
//   INTERIM      — unofficial result published.
//   PROTEST      — interim result challenged, awaiting steward verdict.
const inPlayStatuses = new Set(['CLOSE', 'FALSE_START', 'FINISHED', 'RESULTING', 'INTERIM', 'PROTEST']);

// Race is upcoming. Covers the visual-state signals RAS sends while runners
// are pre-jump:
//   OPEN          — race open for betting (RAS default).
//   PARADING      — runners in the parade ring.
//   GOING_DOWN    — runners en route to the barriers.
//   AT_THE_POST   — runners behind the barriers.
//   GOING_BEHIND  — runners loading into the barriers.
const preMatchStatuses = new Set(['OPEN', 'PARADING', 'GOING_DOWN', 'AT_THE_POST', 'GOING_BEHIND', null]);

/**
 * Determines the status of a RAS racing event based on the wire status and event off time.
 * @param {GetRasEventStatusDto} payload - The payload
 * @param {Nullable<string>} payload.rasStatus - The RAS wire status (e.g. 'OPEN', 'CLOSE', 'RESULT').
 * @param {Nullable<string>} payload.eventOffTime - The event off time. Can be null or a string.
 * @param {boolean} [payload.suspendAtEventOffTime] - Optional flag indicating whether to suspend at event off time.
 * @param {Nullable<string>} [payload.eventStartTime] - Optional event start time used by the suspend-at-off-time check.
 * @returns {SportEventStatuses} - The determined status of the event.
 */
export const getRasEventStatus = (payload: GetRasEventStatusDto): SportEventStatuses => {
  const { rasStatus, eventOffTime, suspendAtEventOffTime, eventStartTime } = payload;

  if (abandonedStatuses.has(rasStatus as string)) {
    return SportEventStatuses.ABANDONED;
  }

  if (finishedStatuses.has(rasStatus as string)) {
    return SportEventStatuses.FINISHED;
  }

  if (suspendedStatuses.has(rasStatus as string)) {
    return SportEventStatuses.SUSPENDED;
  }

  if (suspendAtEventOffTime && eventStartTime) {
    const now = moment();
    const startDate = moment(eventStartTime).utc(true);

    if (now.isAfter(startDate)) {
      return SportEventStatuses.IN_PLAY;
    }
  }

  if (inPlayStatuses.has(rasStatus as string)) {
    return SportEventStatuses.IN_PLAY;
  }

  if (eventOffTime) {
    return SportEventStatuses.IN_PLAY;
  }

  if (preMatchStatuses.has(rasStatus as string | null)) {
    return SportEventStatuses.PRE_MATCH;
  }

  return SportEventStatuses.PRE_MATCH;
};
