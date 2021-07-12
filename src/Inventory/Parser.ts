import Inventory from '../Inventory';
import { EconItem, Asset, Description } from './types';

export type ToEconNewParams = {
	assets: Asset[];
	descriptions: Description[];
}

export type ToEconOldParams = {
	assets: Record<string, Asset>;
	descriptions: Record<string, Description>;
}

export type ToEconParams = {
	assets: Asset[];
	descriptions: Record<string, Description>;
}

class Parser<T> {
	private inventory: Inventory<T>;

	constructor(inventory: Inventory<T>) {
		this.inventory = inventory;
	}

	toEconNew({ assets, descriptions }: ToEconNewParams) {
		/**
		 * Changing array to object
		 */
		const descriptionStore: Record<string, Description> = {};
		for (let i = 0; i < descriptions.length; i++) {
			const description: Description = descriptions[i];

			const classID = description.classid;
			const instanceID = description.instanceid;

			descriptionStore[`${classID}_${instanceID}`] = description;
		}

		return this.toEcon({
			assets,
			descriptions: descriptionStore,
		});
	}

	toEconOld({ assets, descriptions }: ToEconOldParams) {
		return this.toEcon({
			assets: Object.values(assets),
			descriptions,
		});
	}

	toEcon({ assets, descriptions }: ToEconParams) {
		const inventory: T[] = [];

		for (let i = 0; i < assets.length; i++) {
			const asset = assets[i];

			const classID = asset.classid;
			const instanceID = asset.instanceid;

			const description = descriptions[`${classID}_${instanceID}`];

			inventory.push(
				this.format(
					{
						...asset,
						...description,
					},
				),
			);
		}

		return inventory;
	}

	format(econItem: EconItem): T {
		return this.inventory.formatter ? this.inventory.formatter(econItem) : econItem as unknown as T;
	}
}

export default Parser;