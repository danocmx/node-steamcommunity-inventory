import { REQUEST_COUNT_THRESHOLD } from './constant';

export type GetNextCountParams = {
  desiredMoreAmount: number;
  currentAmount: number;
  totalAmount: number;
};

/**
 * Gets count for next request via new method.
 *
 * @return {number}
 */
export function getNextCount({
  desiredMoreAmount,
  currentAmount,
  totalAmount,
}: GetNextCountParams): number {
  const howMuchMore = desiredMoreAmount - currentAmount;
  const howMuchLeft = totalAmount - currentAmount;

  if (howMuchMore <= REQUEST_COUNT_THRESHOLD) return howMuchMore;
  if (howMuchLeft > howMuchMore) return desiredMoreAmount;

  return howMuchLeft;
}
