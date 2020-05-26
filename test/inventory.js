/* eslint-disable */
const { assert } = require('chai');

const Inventory = require('../src/Inventory');

const TEN_SECONDS = 10 * 1000;
const THIRTY_SECONDS = TEN_SECONDS * 3;

describe('Instance', () => {
	it('create', () => {
		const inventory = new Inventory({
			steamID: '76561198122604075',
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
			},
		});

		assert.instanceOf(inventory, Inventory);
	});
});

describe('New Method', () => {
	it('Get first 500', () => {
		return new Inventory()
			.get({
				count: null,
				appID: 730,
				contextID: 2,
				steamID: '76561198122604075',
			})
			.then((results) => {
				assert.isArray(results, 'Inventory is not an array.');
				assert.isNotEmpty(results, 'No items received.');
				assert.isBelow(results.length, 501, 'Received more items in one page request.');
			})

	})

	it('One page inventory', () => {
		const inventory = new Inventory({ steamID: '76561198144346135' });

		return inventory
			.get({
				appID: 440,
				contextID: 2,
			})
			.then((results) => {
				assert.isArray(results, 'Inventory is not an array.');
				assert.isNotEmpty(results, 'No items received.');
			});
	}).timeout(TEN_SECONDS)

	it('3 page inventory', () => {
		const inventory = new Inventory();

		return inventory
			.get({
				appID: 753,
				contextID: 6,
				steamID: '76561198144346135',
				count: 12500,
			})
			.then((results) => {
				assert.isArray(results, 'Inventory is not an array.');
				assert.isNotEmpty(results, 'No items received.');
				assert.isAbove(results.length, 10001, 'Inventory has less than 10001 items. If SID\'s inventory is low omit this error.');
			})
	}).timeout(THIRTY_SECONDS)

	it('All items', () => {
		return new Inventory()
			.get({
				appID: 753,
				contextID: 6,
				steamID: '76561198144346135'
			})
			.then((results) => {
				assert.isArray(results, 'Inventory is not an array.');
				assert.isNotEmpty(results, 'No items received.');
			})
	}).timeout(THIRTY_SECONDS)
});

describe('Old method', () => {
	it('request', () => {
		const inventory = new Inventory({
			method: 'old',
		});

		return inventory
			.get({
				steamID: '76561198259733876', // Paginated
				appID: 440,
				contextID: 2,
			})
			.then((results) => {
				assert.isArray(results, 'Inventory is not an array.');
				assert.isNotEmpty(results, 'No items received.');
			});
	}).timeout(TEN_SECONDS);
});
