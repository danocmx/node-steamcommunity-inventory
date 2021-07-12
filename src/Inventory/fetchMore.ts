export type FetchMoreParams = {
	desiredMoreAmount: number;
	currentAmount: number;
	moreItems: boolean;
}

/**
 * Checks if we can fetch more items.
 * @param {number} desiredAmount Specifies the actual amount we want to get. Over 5000.
 * @return {boolean}
 */
export function fetchMore({ desiredMoreAmount, currentAmount, moreItems }: FetchMoreParams): boolean {
	if (!desiredMoreAmount || !moreItems) {
		return false;
	}

	if (desiredMoreAmount <= currentAmount) {
		return false;
	}

	return true;
};
