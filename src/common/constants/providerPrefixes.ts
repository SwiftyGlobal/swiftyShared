export enum Providers {
  BETRADAR = 'betradar',
  EVERYMATRIX = 'everymatrix',
  LSPORT = 'lsport',
  MANUAL = 'manual',
  PAMEDIA = 'pamedia',
  SIS = 'sis',
  BETGENIUS = 'betgenius',
}

export const ProviderPrefixes = {
  a: Providers.BETGENIUS,
  e: Providers.EVERYMATRIX,
  f: Providers.LSPORT,
  g: Providers.BETRADAR,
  c: Providers.SIS,
  d: Providers.PAMEDIA,
  m: Providers.MANUAL,
} as const;

// needed on js projects
export const FeedProviders = {
  BETGENIUS: 'a',
  SIS: 'c',
  PA_MEDIA: 'd',
  EVERYMATRIX: 'e',
  LS_SPORTS: 'f',
  BET_RADAR: 'g',
  MANUAL: 'm',
} as const;

export const FeedProvidersNames = {
  [FeedProviders.BETGENIUS]: 'Bet Genius',
  [FeedProviders.SIS]: 'SIS',
  [FeedProviders.PA_MEDIA]: 'PA Media',
  [FeedProviders.EVERYMATRIX]: 'EveryMatrix',
  [FeedProviders.LS_SPORTS]: 'LS Sports',
  [FeedProviders.BET_RADAR]: 'Bet Radar',
  [FeedProviders.MANUAL]: 'Manual',
};
