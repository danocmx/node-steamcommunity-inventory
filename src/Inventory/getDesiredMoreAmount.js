const REQUEST_COUNT_THRESHOLD = 5000;

/**
 * Gets `desiredMoreAmount`, it specifies that
 * 	we want to fetch more than 5000 items.
 * @return {number}
 */
module.exports = function (count) {
	if (count > REQUEST_COUNT_THRESHOLD) return count;
	return 0;
};
