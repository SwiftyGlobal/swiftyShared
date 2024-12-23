import type { GetEveryMatrixEventStatusDto } from '../../common';
import { EveryMatrixPhase, SportEventStatuses } from '../../common';
import type { EventPhaseStatus } from '../../types';

export const getEveryMatrixEventStatus = (payload: GetEveryMatrixEventStatusDto): EventPhaseStatus => {
  const { eventStatusId, eventPartId, eventStartTime, now } = payload;

  let current_phase: string = eventStatusId === '1' ? 'Pre Match' : EveryMatrixPhase[eventPartId];

  let current_status: SportEventStatuses =
    eventStatusId === '1' ? SportEventStatuses.PRE_MATCH : SportEventStatuses.IN_PLAY;

  if (!current_phase && current_status == 'in_play') {
    current_phase = 'In Play';
  }

  if (!current_phase && eventStartTime < now) {
    current_phase = 'In Play';
    current_status = SportEventStatuses.IN_PLAY;
  }

  if (eventStatusId === '3') {
    current_phase = 'Finished';
    current_status = SportEventStatuses.FINISHED;
  }

  return {
    current_phase,
    current_status,
  };
};
