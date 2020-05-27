/**
 * Checks if we can fetch more items.
 * @param {number} desiredAmount Specifies the actual amount we want to get. Over 5000.
 * @return {boolean}
 */
module.exports = function ({ desiredMoreAmount, currentAmount, moreItems }) {
	if (!desiredMoreAmount || !moreItems) {
		return false;
	}

	if (desiredMoreAmount <= currentAmount) {
		return false;
	}

	return true;
};
