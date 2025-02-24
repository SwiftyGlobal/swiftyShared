import Decimal from 'decimal.js';

export const stripDecimal = (value: number) => {
  return new Decimal(value).toDecimalPlaces(5);
};
