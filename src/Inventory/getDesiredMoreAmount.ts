const REQUEST_COUNT_THRESHOLD = 5000;

/**
 * Gets `desiredMoreAmount`, it specifies that
 * 	we want to fetch more than 5000 items.
 * @return {number}
 */
export default function getDesiredMoreAmount(count: number): number {
	if (count > REQUEST_COUNT_THRESHOLD) return count;
	return 0;
};
