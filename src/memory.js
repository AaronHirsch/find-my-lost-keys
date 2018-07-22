const { promisify } = require('util');

const redis = require('redis');
const crypto = require('crypto');

module.exports = class Redis {
	constructor() {
		this._client = redis.createClient();
	}

	async answer(data, answer) {
		const hash = this.toHashKey(data.split('\n'));
		const raw_key = await this.get(`key:${hash}`);

		if (!raw_key) return;

		const key = this.toJSON(raw_key);
		const stringified_key = JSON.stringify({
			...key,
			state: answer
		});

		await this.set(`key:${hash}`, stringified_key);
	}

	async setCrawledKeys(crawled_keys) {
		const new_keys = [];
		const existing_keys = [];

		for (let crawled_key of crawled_keys) {
			const hash = this.toHashKey(crawled_key);
			const existing_key = await this.get(`key:${hash}`);

			if (!existing_key) {
				crawled_key = { ...crawled_key, state: 'UNANSWERED' };
				await this.set(`key:${hash}`, JSON.stringify(crawled_key));
				new_keys.push(crawled_key);
			} else {
				existing_keys.push(this.toJSON(existing_key));
			}
		}

		return {
			existing_keys: existing_keys.length,
			new_keys: new_keys.length
		};
	}

	async reset() {
		const all_keys = await this.keys('key:*');
		for (const key of all_keys) {
			await this.del(key);
		}
	}

	async getStats() {
		return {
			unanswered_keys: (await this.getAllUnansweredKeys()).length,
			rejected_keys: (await this.getAllRejectedKeys()).length,
			potential_keys: (await this.getAllPotentialKeys()).length
		};
	}

	async getAllRejectedKeys() {
		const all_keys = await this.getAllKeys();
		return all_keys.filter(({ state }) => state === 'NO');
	}

	async getAllPotentialKeys() {
		const all_keys = await this.getAllKeys();
		return all_keys.filter(({ state }) => state === 'POTENTIAL');
	}

	async getAllUnansweredKeys() {
		const all_keys = await this.getAllKeys();
		return all_keys.filter(({ state }) => state === 'UNANSWERED');
	}

	async getAllKeys() {
		const all_keys = await this.keys('key:*');
		const all_values = [];

		for (const key of all_keys) {
			all_values.push(this.toJSON(await this.get(key)));
		}
		return all_values;
	}

	keys(pattern) {
		return promisify(this._client.keys).bind(this._client)(pattern);
	}

	get(key) {
		return promisify(this._client.get).bind(this._client)(key);
	}

	set(key, value) {
		return promisify(this._client.set).bind(this._client)(key, value);
	}

	del(key) {
		return promisify(this._client.del).bind(this._client)(key);
	}

	toHashKey(data) {
		return crypto
			.createHash('sha256')
			.update(Object.values(data).join(''))
			.digest('hex');
	}

	toJSON(data) {
		return JSON.parse(data);
	}

	static getReady() {
		return new Redis();
	}
};
