import Inventory from '../Inventory';

/**
 * Checks based on input if we would need to follow rate limit.
 * @param {Inventory} inventory instance
 * @param {boolean}
 */
export default function isRateLimited<T>(inventory: Inventory<T>, steamID: string) {
	return isRateLimitedSteamID(inventory, steamID) || !inventory.cookies;
};

function isRateLimitedSteamID<T>(inventory: Inventory<T>, steamID: string) {
	return inventory.steamID !== steamID && steamID;
}
