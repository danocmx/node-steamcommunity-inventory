/**
 * Checks based on input if we would need to follow rate limit.
 * @param {Inventory} inventory instance
 * @param {boolean}
 */
module.exports = function (inventory, steamID) {
	return isRateLimitedSteamID(inventory, steamID) || !inventory.cookies;
};

function isRateLimitedSteamID(inventory, steamID) {
	return inventory.steamID !== steamID && steamID;
}
