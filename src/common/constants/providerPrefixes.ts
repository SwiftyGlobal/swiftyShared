export enum Providers {
  BETRADAR = 'betradar',
  EVERYMATRIX = 'everymatrix',
  LSPORT = 'lsport',
  MANUAL = 'manual',
  PAMEDIA = 'pamedia',
  SIS = 'sis',
  BETGENIUS = 'betgenius',
  RAS = 'ras',
  SWIFTY_FEED = 'swifty-feed',
}

export const ProviderPrefixes = {
  a: Providers.BETGENIUS,
  e: Providers.EVERYMATRIX,
  f: Providers.LSPORT,
  g: Providers.BETRADAR,
  c: Providers.SIS,
  d: Providers.PAMEDIA,
  m: Providers.MANUAL,
  h: Providers.RAS,
  s: Providers.SWIFTY_FEED,
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
  RAS: 'h',
  SWIFTY_FEED: 's',
} as const;

export const FeedProvidersNames = {
  [FeedProviders.BETGENIUS]: 'Bet Genius',
  [FeedProviders.SIS]: 'SIS',
  [FeedProviders.PA_MEDIA]: 'PA Media',
  [FeedProviders.EVERYMATRIX]: 'EveryMatrix',
  [FeedProviders.LS_SPORTS]: 'L-Sports',
  [FeedProviders.BET_RADAR]: 'Bet Radar',
  [FeedProviders.MANUAL]: 'Manual',
  [FeedProviders.RAS]: 'Racing And Sports',
  [FeedProviders.SWIFTY_FEED]: 'Swifty Feed',
};
