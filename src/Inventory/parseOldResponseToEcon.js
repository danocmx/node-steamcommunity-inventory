module.exports = function ({ assets, descriptions, formatter }) {
	const inventory = [];

	for (let i = 0; i < Object.keys(assets).length; i++) {
		const assetID = Object.keys(assets)[i];
		const asset = assets[assetID];

		const classID = asset.classid;
		const instanceID = asset.instanceid;

		const descriptionID = `${classID}_${instanceID}`;
		const description = descriptions[descriptionID];


		const econItem = {
			...asset,
			...description,
		};

		inventory.push(formatter ? formatter(econItem) : econItem);
	}

	return inventory;
};
