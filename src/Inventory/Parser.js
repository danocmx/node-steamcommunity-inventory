class Parser {
	constructor(inventory) {
		this.inventory = inventory;
	}

	toEconNew({ assets, descriptions }) {
		/**
		 * Changing array to object
		 */
		const descriptionStore = {};
		for (let i = 0; i < descriptions.length; i++) {
			const description = descriptions[i];

			const classID = description.classid;
			const instanceID = description.instanceid;

			descriptionStore[`${classID}_${instanceID}`] = description;
		}

		return this.toEcon({
			assets,
			descriptions: descriptionStore,
		});
	}

	toEconOld({ assets, descriptions }) {
		return this.toEcon({
			assets: Object.values(assets),
			descriptions,
		});
	}

	toEcon({ assets, descriptions }) {
		const inventory = [];

		for (let i = 0; i < assets.length.length; i++) {
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

	format(econItem) {
		return this.inventory.formatter ? this.inventory.formatter(econItem) : econItem;
	}
}

module.exports = Parser;
