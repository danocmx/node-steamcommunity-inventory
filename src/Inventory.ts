import axios, { AxiosInstance } from 'axios';
import Bottleneck from 'bottleneck';

import { Parser } from './Inventory/Parser';
import { getDesiredMoreAmount } from './Inventory/getDesiredMoreAmount';
import { fetchMore } from './Inventory/fetchMore';
import { getNextCount } from './Inventory/getNextCount';
import { REQUEST_COUNT_THRESHOLD } from './Inventory/constant';

import { EconItem } from './Inventory/types';

const DAY = 24 * 60 * 60 * 1000;
const SECOND = 1000;

export type InventoryOptions<T> = {
  steamID?: string;
  formatter?: Formatter<T>;
  headers?: Record<string, string>;
  cookies?: string[];
  minTime?: number;
  maxConcurent?: number;
  reservoir?: number;
  reservoirRefreshAmount?: number;
  reservoirRefreshInverval?: number;
  axiosInstance?: AxiosInstance;
};

export type Formatter<T> = (econ: EconItem) => T;

export type GetInventoryParams = {
  steamID: string;
  appID: string;
  contextID: string;
  start?: number;
  count?: number;
  language?: string;
};

export type FetchInventoryPageParams<T> = {
  steamID: string;
  appID: string;
  contextID: string;
  start: number;
  count: number;
  language?: string;
  inventory?: T[];
};

/**
 * Handles inventory requests to SteamCommunity.
 */
export class Inventory<TItem = EconItem> {
  public cookies?: string;
  public steamID?: string;
  public formatter?: Formatter<TItem>;
  public parser: Parser<TItem>;
  public headers?: Record<string, string>;
  public request: AxiosInstance;
  public limiter: Bottleneck;

  /**
   * @param {Object} options
   * @param {string} options.steamID When passed with cookies,
   *    you don't have to rely on rate limit, steam lets you request your inventory freely
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
      steamID,
      formatter,
      headers,
      cookies,
      minTime = 3,
      maxConcurent = SECOND,
      reservoir = 100000,
      reservoirRefreshAmount = DAY,
      reservoirRefreshInverval = 100000,
      axiosInstance = axios.create()
    } = options;

    this.steamID = steamID;
    this.formatter = formatter;

    this.parser = new Parser(this);

    this.headers = headers;
    if (cookies) this.setCookies(cookies);

    this.request = axiosInstance;

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
   * Gets inventory from new endpoint that has better rate limit but less data.
   * @param {string} steamID
   * @param {string} appID
   * @param {string} contextID
   * @param {string} [start] from which assetID do you want to start
   * @param {number} [count=Infinity] If set gets the exact amount of items,
   *    if `Infinity` gets all recursively,
   *    if `void` gets only the first 500
   * @param {string} [language=english]
   * @return {Promise<TItem[]>}
   */
  public get({
    steamID,
    appID,
    contextID,
    start = 0,
    count = Infinity,
    language = 'english',
  }: GetInventoryParams): Promise<TItem[]> {
    return this.fetchInventoryPage({
      steamID,
      appID,
      contextID,
      start,
      count,
      language,
    });
  }

  private async fetchInventoryPage({
    steamID,
    appID,
    contextID,
    start,
    count,
    language,
    inventory = [],
  }: FetchInventoryPageParams<TItem>): Promise<TItem[]> {
    const desiredMoreAmount = getDesiredMoreAmount(count);
    if (desiredMoreAmount) {
      count = REQUEST_COUNT_THRESHOLD;
    }

    const url = `https://steamcommunity.com/inventory/${steamID}/${appID}/${contextID}`;

    const { data } = await this.sendRequest({
      url,
      settings: {
        headers: this.getHeaders(),
        params: {
          start,
          count,
          l: language,
        },
      },
    });

    if (data.error) {
      return Promise.reject(new Error(`Unsuccessful inventory request, ${data.error}`));
    }

    if (data.success !== 1) {
      return Promise.reject(new Error(`Unsuccessful inventory request, ${data.message}`));
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
      return this.fetchInventoryPage({
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
      });
    }

    return inventory;
  }

  private sendRequest({
    url,
    settings,
    priority = 3,
  }: {
    url: string;
    settings: Record<any, any>;
    priority?: number;
  }) {
    return this.limiter.schedule({ priority: priority }, () =>
      this.request.get(url, settings),
    );
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
