import type { ProviderPrefixes } from '../common';
import type { ObjectKeys } from './objectKeys';

/**
 * @description
 * m - manual provider (stored under cms)
 * a - betgenius (stored under betgenius)
 * c - sis (stored under sis)
 * d - pa media (stored under pa_media)
 * e - every matrix (stored under every_matrix)
 * f - ls sports (stored under ls_sports)
 * g - bet radar (stored under bet_radar)
 */
export type SportProviders = ObjectKeys<typeof ProviderPrefixes>;

export type RacingSportProviders = Extract<SportProviders, 'c' | 'd'>;

export type RegularSportProviders = Exclude<SportProviders, RacingSportProviders>;
