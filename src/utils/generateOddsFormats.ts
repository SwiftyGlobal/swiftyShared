import type { Nullable } from '../types';
import type { OddsFormatsModel } from '../models';
import { numberFormatter } from './numberFormatter';
import { decimalToFractional } from './decimalToFractional';
import { decimalToAmerican } from './decimalToAmerican';

export const generateOddsFormats = (
  oddDecimal: Nullable<string>,
  oddsFractional: Nullable<string>,
): OddsFormatsModel => {
  const returnData: OddsFormatsModel = {
    odds_decimal: 'SP',
    odds_american: 'SP',
    odds_fractional: 'SP',
  };

  if ((!oddDecimal || oddDecimal === '0' || oddDecimal == null) && !oddsFractional) {
    return returnData;
  }

  let decimalNumber = 0;
  if (oddsFractional) {
    const tmp = oddsFractional.split('/');
    decimalNumber = Number.parseFloat(tmp[0]) / Number.parseFloat(tmp[1]);
    decimalNumber += 1;
  } else {
    decimalNumber = Number.parseFloat(oddDecimal || '0');
  }

  if (!decimalNumber) {
    return returnData;
  }

  // Prepare decimal format from original number and remove comma from it
  const formattedDecimal = numberFormatter(decimalNumber).replace(/,/g, '');

  returnData.odds_decimal = formattedDecimal;

  returnData.odds_fractional = oddsFractional || decimalToFractional(decimalNumber);
  returnData.odds_american = decimalToAmerican(decimalNumber);

  return returnData;
};
