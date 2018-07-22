const Bot = require('./bot.js');
const Memory = require('./memory.js');
const Crawler = require('./crawler.js');

module.exports = {
	start() {
		const BotInstance = Bot.getReady();
		const MemoryInstance = Memory.getReady();
		const CrawlerInstance = Crawler.getReady();

		BotInstance.on('crawler:check', async () => {
			try {
				const crawled_keys = await CrawlerInstance.crawlAllKeys();
				const stats = await MemoryInstance.setCrawledKeys(crawled_keys);
				await BotInstance.sendCrawlerStats(stats);
			} catch (err) {
				await BotInstance.sendError(err);
			}
		});

		BotInstance.on('memory:reset', async () => {
			try {
				await MemoryInstance.reset();
				const stats = await MemoryInstance.getStats();
				await BotInstance.sendMemoryStats(stats);
			} catch (err) {
				await BotInstance.sendError(err);
			}
		});

		BotInstance.on('memory:show:stats', async () => {
			try {
				const stats = await MemoryInstance.getStats();
				await BotInstance.sendMemoryStats(stats);
			} catch (err) {
				await BotInstance.sendError(err);
			}
		});

		BotInstance.on('memory:list:one:unanswered', async () => {
			try {
				const [unanswered_key] = await MemoryInstance.getAllUnansweredKeys();
				await BotInstance.sendUnansweredKeys([unanswered_key]);
			} catch (err) {
				await BotInstance.sendError(err);
			}
		});

		BotInstance.on('memory:list:unanswered', async () => {
			try {
				const unanswered_keys = await MemoryInstance.getAllUnansweredKeys();
				await BotInstance.sendUnansweredKeys(unanswered_keys);
			} catch (err) {
				await BotInstance.sendError(err);
			}
		});

		BotInstance.on('memory:list:rejected', async () => {
			try {
				const rejected_keys = await MemoryInstance.getAllRejectedKeys();
				await BotInstance.sendKeys(rejected_keys);
			} catch (err) {
				await BotInstance.sendError(err);
			}
		});

		BotInstance.on('memory:list:potential', async () => {
			try {
				const potential_keys = await MemoryInstance.getAllPotentialKeys();
				await BotInstance.sendKeys(potential_keys);
			} catch (err) {
				await BotInstance.sendError(err);
			}
		});

		BotInstance.on('memory:answer', async (data, answer) => {
			try {
				await MemoryInstance.answer(data, answer);
				const [unanswered_key] = await MemoryInstance.getAllUnansweredKeys();
				await BotInstance.sendUnansweredKeys([unanswered_key]);
			} catch (err) {
				await BotInstance.sendError(err);
			}
		});
	}
};
