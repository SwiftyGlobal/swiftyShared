import type { GetEveryMatrixEventStatusDto } from '@dto/getEveryMatrixEventStatus.dto';
import type { EventPhaseStatus } from '@internal-types/eventPhaseStatus';
import { EveryMatrixPhase } from '@constants/everyMatrixPhase';
import { SportEventStatuses } from '@constants/sportEventStatuses';

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
