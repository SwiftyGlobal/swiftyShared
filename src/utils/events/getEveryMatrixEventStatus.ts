import { isMarketRace } from '../markets';
import { EveryMatrixPhase } from '../../common';
import type { EventPhaseStatus, SportEventStatuses } from '../../types';

export const getEveryMatrixEventStatus = (
  eventStatusId: string,
  eventPartId: number,
  eventHasLiveStatus: boolean,
  eventStartTime: string,
  now: string,
  sportslug: string,
): EventPhaseStatus => {
  let current_phase: string = eventStatusId === '1' ? 'Pre Match' : EveryMatrixPhase[eventPartId];

  let current_status: SportEventStatuses = eventStatusId === '1' ? 'pre_match' : 'in_play';

  if (!current_phase && current_status == 'in_play') {
    if (!eventHasLiveStatus) {
      // TODO - Replace with isMarketRaceV2
      current_phase = isMarketRace(sportslug) ? 'In Play' : 'In Play (No Live Data)';
    } else {
      current_phase = 'In Play (Status Based)';
    }
  }

  if (!current_phase && eventStartTime < now) {
    current_phase = 'In Play (Time Based)';
    current_status = 'in_play';
  }

  if (eventStatusId === '3') {
    current_phase = 'Finished';
    current_status = 'finished';
  }

  return {
    current_phase,
    current_status,
  };
};
