/**
 * Checks if we can fetch more items.
 * @param {number} desiredAmount Specifies the actual amount we want to get. Over 5000.
 * @return {boolean}
 */
module.exports = function ({ desiredMoreAmount, currentAmount, moreItems }) {
	if (!desiredMoreAmount || !moreItems) {
		return false;
	}

	// Transfer
	if (desiredMoreAmount <= currentAmount) {
		return false;
	}

	return true;
};

/*
> f({ desiredMoreAmount: 12500, currentAmount: 5000, moreItems: 1 })
true
> f({ desiredMoreAmount: 7500, currentAmount: 10000, moreItems: 1 })
false
*/
