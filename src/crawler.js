const puppeteer = require('puppeteer');

const { FUNDBUERO } = require('./config.js');

module.exports = class Crawler {
	constructor() {
		this._crawling = false;
	}

	async crawlAllKeys() {
		if (this._crawling) throw Error('stillCrawling');

		this._crawling = true;

		this._browser = await puppeteer.launch();
		this._page = await this._browser.newPage();

		await this._page.goto(FUNDBUERO);

		const keys = await this._page.evaluate(() => {
			return Array.from(
				document.querySelectorAll('.ergebnislisterahmeninnen tr')
			)
				.filter((row, i) => i > 0 && Array.from(row.children).length === 4)
				.map(row => {
					const [description, date, place, office] = Array.from(row.children);
					return {
						description: description.textContent.trim(),
						date: date.textContent.trim(),
						place: place.textContent.trim(),
						office: office.textContent.trim()
					};
				});
		});

		await this._browser.close();

		this._browser = this._page = this._crawling = null;

		return keys;
	}

	static getReady() {
		return new Crawler();
	}
};
