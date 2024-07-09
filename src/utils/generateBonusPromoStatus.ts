import moment from "moment";
import { UserFreeBetModel } from "../models";
import { BonusPromotionStatuses } from "../types";

/**
 * @description Generate bonus promo status
 */
export const generateBonusPromoStatus = (freeBet: UserFreeBetModel): BonusPromotionStatuses => {
    const now = moment();

    const isPromoExpired = moment(freeBet.end_date).isBefore(now);

    if (isPromoExpired) {
        return 'expired';
    }

    const isPromoAmountUsed = +freeBet.amount_used >= +freeBet.amount;

    if (isPromoAmountUsed) {
        return 'used';
    }

    const isPromoAmountPartlyUsed = +freeBet.amount_used > 0;

    if (isPromoAmountPartlyUsed) {
        return 'partly_used';
    }

    return 'available';
}
