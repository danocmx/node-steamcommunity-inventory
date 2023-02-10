const { assert } = require('chai');

const { Inventory } = require('../dist/Inventory');

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
