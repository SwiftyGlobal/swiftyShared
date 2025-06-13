import moment from 'moment';

import { generateBonusPromoStatus } from '../../utils';
import type { UserFreeBetModel } from '../../models';

describe('generateBonusPromoStatus', () => {
  const futureDate = moment().add(1, 'day').toISOString();
  const pastDate = moment().subtract(1, 'day').toISOString();

  const baseFreeBet: UserFreeBetModel = {
    id: 1,
    user_id: 1,
    bonus_engine_id: null,
    reason: 'test',
    amount: '0',
    amount_used: '0',
    end_date: new Date().toISOString(),
    usage: 'sports',
    turn_requirements: 'none',
    casino_restrictions: '',
    created_at: new Date().toISOString(),
    created_by: 1,
    modified_at: null,
    modified_by: null,
    done: 0,
    sport_restrictions: '',
    status: '',
    provider: '',
  };

  it('should return "expired" when end_date is in the past', () => {
    const freeBet: UserFreeBetModel = {
      ...baseFreeBet,
      end_date: pastDate,
      amount: '100',
      amount_used: '0',
    } as UserFreeBetModel;

    expect(generateBonusPromoStatus(freeBet)).toBe('expired');
  });

  it('should return "used" when amount_used >= amount', () => {
    const freeBet: UserFreeBetModel = {
      ...baseFreeBet,
      end_date: futureDate,
      amount: '100',
      amount_used: '100',
    } as UserFreeBetModel;

    expect(generateBonusPromoStatus(freeBet)).toBe('used');
  });

  it('should return "partly_used" when amount_used > 0 and < amount', () => {
    const freeBet: UserFreeBetModel = {
      ...baseFreeBet,
      end_date: futureDate,
      amount: '100',
      amount_used: '50',
    } as UserFreeBetModel;

    expect(generateBonusPromoStatus(freeBet)).toBe('partly_used');
  });

  it('should return "available" when amount_used is 0 and not expired', () => {
    const freeBet: UserFreeBetModel = {
      ...baseFreeBet,
      end_date: futureDate,
      amount: '100',
      amount_used: '0',
    } as UserFreeBetModel;

    expect(generateBonusPromoStatus(freeBet)).toBe('available');
  });
});
