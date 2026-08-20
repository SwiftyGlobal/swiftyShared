import type { EventPhaseStatus } from '../../types';
import type { GetBetRadarEventStatusDto } from '../../common';
import { EventStatuses, SportEventStatuses, SportEventStatusLabels, getBetRadarMatchStatusPhase } from '../../common';

/**
 * @description Maps a BetRadar event status id to the canonical SportEventStatus, and resolves the
 * richest phase label available.
 *
 * `current_status` comes from the event-level lifecycle code (`status`). `current_phase` prefers
 * the period-level code (`match_status`) so an in-play event reads "2nd Set" or "1st Half" rather
 * than a flat "In-Play" — that period code is the only thing that distinguishes them, and it was
 * previously ignored entirely.
 *
 * The phase falls back to the status label in three cases, all deliberate: the caller did not
 * supply `matchStatus`/`sportSlug`; the code is not one we can name for that sport (see
 * BetRadarMatchStatusPhases — interstitial states like half-time and penalties are omitted rather
 * than guessed); or the event is not in play, where "1st Half" would be actively misleading on a
 * fixture that has ended.
 *
 * @param payload {GetBetRadarEventStatusDto} - The event status id, plus optionally the period code and sport.
 * @return {EventPhaseStatus} - The canonical status slug plus a human-readable phase label.
 * @example
 * getBetRadarEventStatus({ eventStatusId: '1' });                                          // { current_status: 'in_play', current_phase: 'In-Play' }
 * getBetRadarEventStatus({ eventStatusId: '1', matchStatus: '9', sportSlug: 'tennis' });    // { current_status: 'in_play', current_phase: '2nd Set' }
 * getBetRadarEventStatus({ eventStatusId: '1', matchStatus: '7', sportSlug: 'soccer' });    // { current_status: 'in_play', current_phase: '2nd Half' }
 * getBetRadarEventStatus({ eventStatusId: '1', matchStatus: '31', sportSlug: 'soccer' });   // half-time is unnamed -> { current_phase: 'In-Play' }
 * getBetRadarEventStatus({ eventStatusId: '3', matchStatus: '7', sportSlug: 'soccer' });    // ended -> { current_status: 'finished', current_phase: 'Finished' }
 * getBetRadarEventStatus({ eventStatusId: '99' });                                         // unknown -> { current_status: 'pre_match', current_phase: 'Pre-Match' }
 */
export const getBetRadarEventStatus = (payload: GetBetRadarEventStatusDto): EventPhaseStatus => {
  const { eventStatusId, matchStatus, sportSlug } = payload;

  const current_status = EventStatuses.BET_RADAR[eventStatusId] ?? SportEventStatuses.PRE_MATCH;
  const statusLabel = SportEventStatusLabels[current_status];

  // A period label only describes an event that is actually in that period. Emitting "1st Half"
  // for a finished or postponed fixture would contradict current_status, and the feed keeps the
  // last match_status on the row after the event ends — so the in-play check is load-bearing.
  if (current_status !== SportEventStatuses.IN_PLAY) {
    return { current_status, current_phase: statusLabel };
  }

  const phase = getBetRadarMatchStatusPhase(sportSlug, matchStatus);

  return { current_status, current_phase: phase ?? statusLabel };
};
