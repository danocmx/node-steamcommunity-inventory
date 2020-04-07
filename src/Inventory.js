/* eslint-disable */
const bottleneck = require('bottleneck');

const parseResponseToEcon = require('./Inventory/parseResponseToEcon');

/**
 * Handles inventory requests to SteamCommunity.
 */
class Inventory {
	/**
	 * @param {string} options.steamID
	 * @param {number} options.timeout time for requests
	 * @param {number} options.requests how many request in given timeout
	 * @param {string='new'|'old'} options.method method we use for inventory
	 * @param {Function} options.formatter method that formats the inventory
	 */
	constructor(options = {}) {
		const { steamID, timeout, requests, method = 'new', formatter } = options;

		this.steamID = steamID;
		this.timeout = timeout;
		this.requests = requests;
		this.method = method;
		this.formatter = formatter;

		this.request = axios.defaults({

		});
	}

	get({ steamID, appid, contextid }) {
		const method = chooseMethod(this.method);

		// Bottleneck usage
		// 
	}

	/**
	 * Gets inventory from old deprecated endpoint that has more data.
	 * @param {string} steamID
	 * @param {string} appID
	 * @param {string} contextID
	 * @param {number} start From which item do we start.
	 * @param {boolean} tradableOnly
	 * @param {Object[]} inventory Only if you wanna append more items to it. Used for recursive.
	 * @return {Promise<EconItem[]>}
	 */
	getViaOldEndpoint({ steamID, appID, contextID, start = 0, tradableOnly = true, inventory = [] }) {
		const url = `https://steamcommunity.com/profiles/${steamID}/inventory/json/${appID}/${contextID}/`;

		return axios
			.get(
				url,
				{
					data: {
						start,
						trading: tradableOnly ? 1 : 0,
					},
				},
			)
			.then(({ data }) => {
				inventory.push(
					parseResponseToEcon({
						assets: data.rgInventory,
						descriptions: data.rgDescriptions,
					}),
				);
	
				const { more } = data;
				const moreStart = data.more_start;
	
				if (more) {
					return this.getViaOldEndpoint({
						steamID,
						appID,
						contextID,
						start: moreStart,
						tradableOnly,
						inventory,
					});
				}
	
				return inventory;
			});
	}

	/**
	 * Gets inventory from new endpoint that has better rate limit but less data.
	 * @param {string} steamID
	 * @param {string} appID
	 * @param {string} contextID
	 * @param {string} language
	 * @return {Promise<EconItem[]>}
	 */
	getViaNewEndpoint({ steamID, appID, contextID, language = 'english' }) {
		const url = `https://steamcommunity.com/inventory/${steamID}/${appID}/${contextID}?l=english`;

		return axios
			.get(
				url,
				{
					data: {
						l: language,
					},
				},
			)
			.then(({ data }) => parseResponseToEcon(data));
	}
}

module.exports = Inventory;
