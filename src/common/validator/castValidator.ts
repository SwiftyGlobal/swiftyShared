import { ValidateFunction } from 'ajv';

import { AjvValidator } from './ajvValidator';

const ajv = AjvValidator.getInstance();

const buildSchema = (selectionLength: number) => ({
  type: 'array',
  minItems: 1,
  items: {
    type: 'object',
    required: ['selectionIds', 'dividend'],
    additionalProperties: false,
    properties: {
      selectionIds: {
        type: 'array',
        minItems: selectionLength,
        maxItems: selectionLength,
        items: { type: 'string', minLength: 1 },
      },
      dividend: { type: 'number', exclusiveMinimum: 0 },
    },
  },
});

const forecastCombosValidator: ValidateFunction = ajv.compile(buildSchema(2));
const tricastCombosValidator: ValidateFunction = ajv.compile(buildSchema(3));

const hasDuplicateRows = (combos: Array<{ selectionIds: string[] }>): boolean => {
  const seen = new Set<string>();
  for (const combo of combos) {
    const key = JSON.stringify(combo.selectionIds);
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
};

export interface CastValidationResult {
  valid: boolean;
  errors: string[];
}

const runValidator = (validator: ValidateFunction, data: unknown, label: string): CastValidationResult => {
  if (!validator(data)) {
    return {
      valid: false,
      errors: (validator.errors ?? []).map((e) => `${label}${e.instancePath} ${e.message ?? 'invalid'}`),
    };
  }
  if (hasDuplicateRows(data as Array<{ selectionIds: string[] }>)) {
    return { valid: false, errors: [`${label}: duplicate selectionIds row`] };
  }
  return { valid: true, errors: [] };
};

export const validateForecastCombos = (data: unknown): CastValidationResult =>
  runValidator(forecastCombosValidator, data, 'forecast_combos');

export const validateTricastCombos = (data: unknown): CastValidationResult =>
  runValidator(tricastCombosValidator, data, 'tricast_combos');
