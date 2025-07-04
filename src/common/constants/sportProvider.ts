export enum SportProviders {
  SIS = 'c',
  PA_MEDIA = 'd',
  EVERYMATRIX = 'e',
  LS_SPORTS = 'f',
  BET_RADAR = 'g',
}

export const SportProviderNames: Record<SportProviders, string> = {
  [SportProviders.SIS]: 'SIS',
  [SportProviders.PA_MEDIA]: 'PA Media',
  [SportProviders.EVERYMATRIX]: 'EveryMatrix',
  [SportProviders.LS_SPORTS]: 'LS Sports',
  [SportProviders.BET_RADAR]: 'Bet Radar',
};
