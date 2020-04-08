const { assert } = require('chai');
const { it, describe } = require('mocha');

const Inventory = require('../src/Inventory');

/**
 * @constant
 */
const TEN_SECONDS_IN_MILISECONDS = 10 * 1000;

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
	it('request', () => {
		const inventory = new Inventory();

		return inventory
			.get({
				steamID: '76561198144346135',
				appID: 440,
				contextID: 2,
			})
			.then((results) => {
				assert.isArray(results, 'Inventory is not an array.');
			});
	});
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
			});
	})
		.timeout(TEN_SECONDS_IN_MILISECONDS);
});
