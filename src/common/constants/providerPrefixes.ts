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
