import axios, { AxiosInstance } from 'axios';
import Bottleneck from 'bottleneck';

import { Parser } from './Inventory/Parser';
import { isRateLimited } from './Inventory/isRateLimited';
import { getDesiredMoreAmount } from './Inventory/getDesiredMoreAmount';
import { fetchMore } from './Inventory/fetchMore';
import { getNextCount } from './Inventory/getNextCount';

import { EconItem } from './Inventory/types';

const DAY = 24 * 60 * 60 * 1000;
const SECOND = 1000;

export type InventoryOptions<T> = {
	steamID?: string;
	method?: 'new' | 'old';
	formatter?: Formatter<T>;
	headers?: Record<string, string>;
	cookies?: string[];
	minTime?: number;
	maxConcurent?: number;
	reservoir?: number;
	reservoirRefreshAmount?: number;
	reservoirRefreshInverval?: number;
}

export type Formatter<T> = (econ: EconItem) => T;

export type NewMethodParams<T> = {
	steamID: string;
	appID: string;
	contextID: string;
	start?: number;
	count?: number;
	language?: string;
	inventory?: T[];
}

export type OldMethodParams<T> = {
	steamID: string;
	appID: string;
	contextID: string;
	start?: number;
	count?: number;
	tradableOnly?: boolean;
	inventory?: T[];
}

/**
 * Handles inventory requests to SteamCommunity.
 */
export class Inventory<TItem = EconItem> {
	public cookies?: string;
	public steamID?: string;
	public formatter?: Formatter<TItem>;
	public method: string;
	public parser: Parser<TItem>;
	public headers?: Record<string, string>;
	public request: AxiosInstance;
	public limiter: Bottleneck;

	/**
	 * @param {Object} options
	 * @param {string} options.steamID When passed with cookies,
	 * 	you don't have to rely on rate limit, steam lets you request your inventory freely
	 * @param {number} options.minTime @see https://github.com/SGrondin/bottleneck#constructor
	 * @param {number} options.maxConcurent @see https://github.com/SGrondin/bottleneck#constructor
	 * @param {number} options.reservoir @see https://github.com/SGrondin/bottleneck#constructor
	 * @param {number} options.reservoirRefreshAmount @see https://github.com/SGrondin/bottleneck#constructor
	 * @param {number} options.reservoirRefreshInverval @see https://github.com/SGrondin/bottleneck#constructor
	 * @param {'new'|'old'} options.method method we use for inventory
	 * @param {Function} options.formatter modifies econItem before being passed into then
	 * @param {Object} [options.headers]
	 */
	constructor(options: InventoryOptions<TItem> = {}) {
		const {
			steamID, method = 'new', formatter, headers, cookies,
			minTime = 3, maxConcurent = SECOND,
			// Afaik API allows 100,000 requests per day
			reservoir = 100000, reservoirRefreshAmount = DAY,
			reservoirRefreshInverval = 100000,
		} = options;

		this.steamID = steamID;
		this.method = method;
		this.formatter = formatter;

		this.parser = new Parser(this);

		this.headers = headers;
		if (cookies) this.setCookies(cookies);

		this.request = axios.create();

		this.limiter = new Bottleneck({
			maxConcurent,
			minTime,
			reservoir,
			reservoirRefreshInverval,
			reservoirRefreshAmount,
		});
	}

	/**
	 * Sets cookies to instance, in key=value format.
	 * @param {string[]} cookies
	 */
	setCookies(cookies: string[]) {
		this.cookies = cookies.join('; ');
	}

	/**
	 * A shorthand function used for requesting and limiting.
	 * @param {Object} options @see Inventory.prototype.getViaOldEndpoint
	 * 	@see Inventory.prototype.getViaNewEndpoint
	 */
	get(options: (NewMethodParams<TItem> | OldMethodParams<TItem>) & { steamID?: string }) {
		const method = this.chooseMethod();

		const opts: NewMethodParams<TItem> | OldMethodParams<TItem> = { 
			...options, 
			steamID: options.steamID || this.steamID as string,
		};

		/**
		 * Our SteamID is not rate limited when loggedIn.
		 */
		if (!isRateLimited<TItem>(this, opts.steamID)) {
			return method(opts);
		}

		return this.limiter.schedule(() => method(opts));
	}

	/**
	 * Chooses method and binds it.
	 */
	private chooseMethod() {
		if (this.method === 'old') {
			return Inventory.prototype.getViaOldEndpoint.bind(this);
		}

		return Inventory.prototype.getViaNewEndpoint.bind(this);
	}

	/**
	 * Gets inventory from old deprecated endpoint that has more data from the app server.
	 * 	Please note that this method should be used and is only here for the extra data.
	 * 	It inacurately gets items from the server and has a low request limit (around 4 per minute).
	 * @param {string} steamID
	 * @param {string} appID
	 * @param {string} contextID
	 * @param {number} [start] From which item do we start.
	 * @param {number} [count=Infinity] How many items you want,
	 * 	Every request gets roughly 2000 items, so count should be multiple of 2000, can also be:
	 * 	`Infinity` gets all recursively,
	 * 	`void` gets only the first 500
	 * @param {boolean} [tradableOnly=true]
	 * @param {Object[]} [inventory=[]] Only if you wanna append more items to it. Used for recursive.
	 * @return {Promise<EconItem[]>}
	 */
	private getViaOldEndpoint({ steamID, appID, contextID, start = 0,
		count = Infinity, tradableOnly = true, inventory = [] }: OldMethodParams<TItem>): Promise<TItem[]> {
		const url = `https://steamcommunity.com/profiles/${steamID}/inventory/json/${appID}/${contextID}/`;

		return this.request
			.get(
				url,
				{
					...this.getHeaders(),
					params: {
						start,
						trading: tradableOnly ? 1 : 0,
					},
				},
			)
			.then(({ data }) => {
				if (!data.success) {
					return Promise.reject(
						new Error(`Unsuccessful request, ${data.message}`),
					);
				}

				inventory.push(
					...this.parser.toEconOld({
						assets: data.rgInventory,
						descriptions: data.rgDescriptions,
					}),
				);

				const { more } = data;
				const moreStart = data.more_start;

				// We can determine if we can fetch more.
				if (fetchMore({
					desiredMoreAmount: count,
					currentAmount: inventory.length,
					moreItems: more,
				})) {
					// `priority` is now higher so recursive function is prefered.
					return this.limiter.schedule({ priority: 4 }, () => this.getViaOldEndpoint(
						{
							steamID,
							appID,
							count,
							contextID,
							start: moreStart,
							tradableOnly,
							inventory,
						},
					));
				}

				return inventory;
			});
	}

	/**
	 * Gets inventory from new endpoint that has better rate limit but less data.
	 * @param {string} steamID
	 * @param {string} appID
	 * @param {string} contextID
	 * @param {string} [start] from which assetID do you want to start
	 * @param {number} [count=Infinity] If set gets the exact amount of items,
	 * 	if `Infinity` gets all recursively,
	 * 	if `void` gets only the first 500
	 * @param {string} [language=english]
	 * @param {object[]} [inventory] For recursion.
	 * @return {Promise<EconItem[]>}
	 */
	private getViaNewEndpoint({ steamID, appID, contextID, start, count = Infinity, language = 'english', inventory = [] }: NewMethodParams<TItem>): Promise<TItem[]> {
		const desiredMoreAmount = getDesiredMoreAmount(count);
		if (desiredMoreAmount) {
			// eslint-disable-next-line no-param-reassign
			count = 5000;
		}

		const url = `https://steamcommunity.com/inventory/${steamID}/${appID}/${contextID}?l=english`;

		// TODO: parse for EResult errors.
		// Error: "EYldRefreshAppIfNecessary failed with EResult 20"

		return this.request
			.get(
				url,
				{
					...this.getHeaders(),
					params: {
						start,
						count,
						l: language,
					},
				},
			)
			.then(({ data }) => {
				if (data.error) {
					return Promise.reject(
						new Error(`Unsuccessful request, ${data.error}`),
					);
				}

				if (data.success !== 1) {
					return Promise.reject(
						new Error(`Unsuccessful request, ${data.message}`),
					);
				}

				if (data.total_inventory_count < 1) {
					return inventory;
				}

				inventory.push(
					...this.parser.toEconNew({
						assets: data.assets,
						descriptions: data.descriptions,
					}),
				);

				if (
					fetchMore({
						desiredMoreAmount,
						currentAmount: inventory.length,
						moreItems: data.more_items,
					})
				) {
					return this.limiter.schedule({ priority: 4 }, () => this.getViaNewEndpoint({
						steamID,
						appID,
						contextID,
						language,
						inventory,

						start: data.last_assetid,
						count: getNextCount({
							desiredMoreAmount,
							currentAmount: inventory.length,
							totalAmount: data.total_inventory_count,
						}),
					}));
				}

				return inventory;
			});
	}

	/**
	 * Returns cookies in object for iterators.
	 * @return {Object}
	 */
	private getHeaders() {
		const { headers = {}, cookies } = this;

		return {
			...headers,
			// Adds cookies property only if we have 'em
			...(cookies ? { Cookie: cookies } : {}),
		};
	}
}
