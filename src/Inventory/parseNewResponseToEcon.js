module.exports = function ({ assets, descriptions, formatter }) {
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

	const inventory = [];
	for (let i = 0; i < assets.length; i++) {
		const asset = assets[i];

		const classID = asset.classid;
		const instanceID = asset.instanceid;

		const description = descriptionStore[`${classID}_${instanceID}`];

		const econItem = {
			...description,
			...asset,
		};

		inventory.push(formatter ? formatter(econItem) : econItem);
	}

	return inventory;
};
