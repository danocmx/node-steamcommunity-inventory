import { REQUEST_COUNT_THRESHOLD } from './constant';

/**
 * Gets `desiredMoreAmount`, it specifies that
 * 	we want to fetch more than 2000 items.
 * @return {number}
 */
export function getDesiredMoreAmount(count: number): number {
  if (count > REQUEST_COUNT_THRESHOLD) return count;
  return 0;
}
