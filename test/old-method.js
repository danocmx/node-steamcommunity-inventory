const { assert } = require('chai');

const Inventory = require('../dist/Inventory').default;

const TEN_SECONDS = 10 * 1000;
const THIRTY_SECONDS = TEN_SECONDS * 3;

describe('Old method', () => {
	it('One request', () => {
		const inventory = new Inventory({
			method: 'old',
		});
		
		return inventory
			.get({
				steamID: '76561197967159739',
				appID: 440,
				contextID: 2,
				count: null,
			})
			.then((results) => {
				assert.isArray(results, 'Inventory is not an array.');
				assert.isNotEmpty(results, 'No items received.');
			})
	}).timeout(TEN_SECONDS);

	it('Get 12000', () => {
		const inventory = new Inventory({
			method: 'old',
		});

		return inventory
			.get({
				steamID: '76561198144346135',
				appID: 753,
				contextID: 6,
				count: 3950,
			})
			.then((results) => {
				assert.isArray(results, 'Inventory is not an array.');
				assert.isNotEmpty(results, 'No items received.');
				assert.isAbove(results.length, 2000, 'Inventory has less than 2000 items. If SID\'s inventory is low omit this error.');
			});
	}).timeout(THIRTY_SECONDS);

	// Not using this for tests as it usually gets rate limited.
	// And it cannot get accurate results until I further test it.
	/* 
	it('Get all items', () => {
		const inventory = new Inventory({
			method: 'old',
		});

		return inventory
			.get({
				steamID: '76561198144346135',
				appID: 753,
				contextID: 6,
			})
			.then((results) => {
				assert.isArray(results, 'Inventory is not an array.');
				assert.isNotEmpty(results, 'No items received.');
			});
	}).timeout(THIRTY_SECONDS);
	*/
});