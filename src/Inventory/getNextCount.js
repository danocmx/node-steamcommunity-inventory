/**
 * Gets count for next request via new method.
 *
 * @return {number}
 */
module.exports = function ({ desiredMoreAmount, currentAmount, totalAmount }) {
	const howMuchMore = desiredMoreAmount - currentAmount;
	const howMuchLeft = totalAmount - currentAmount;

	if (howMuchMore <= 5000) return howMuchMore;
	if (howMuchLeft > howMuchMore) return desiredMoreAmount;

	return howMuchLeft;
};
