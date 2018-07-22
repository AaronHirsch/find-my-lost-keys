const util = require('util');
const events = require('events');
const TelegramBot = require('node-telegram-bot-api');

const config = require('./config.js');
const RESPONSES = require('./responses.js');
const MESSAGES = require('./messages.js');

module.exports = class Bot extends events.EventEmitter {
	constructor(token) {
		super();

		this.bot = new TelegramBot(token, { polling: true });
		this.bot.on('message', this.evaluateMessage.bind(this));
		this.bot.on('callback_query', this.evaluateAnswer.bind(this));
	}

	evaluateMessage(message) {
		if (!this.isValid(message)) return;

		switch (message.text.toLowerCase()) {
			case this.MESSAGES.CHECK: {
				this.emit('crawler:check');
				break;
			}
			case this.MESSAGES.SHOW_STATS: {
				this.emit('memory:show:stats');
				break;
			}
			case this.MESSAGES.RESET: {
				this.emit('memory:reset');
				break;
			}
			default: {
				this.send(this.RESPONSES.DUNNO);
			}
		}
	}

	sendCrawlerStats({ existing_keys, new_keys }) {
		return this.send(
			util.format(this.RESPONSES.CRAWLER_STATS, new_keys, existing_keys),
			this.GENERIC_REPLY_MARKUP
		);
	}

	sendMemoryStats({ rejected_keys, potential_keys, unanswered_keys }) {
		return this.send(
			util.format(
				this.RESPONSES.MEMORY_STATS,
				unanswered_keys,
				rejected_keys,
				potential_keys
			),
			this.GENERIC_REPLY_MARKUP
		);
	}

	async sendUnansweredKeys(keys) {
		await this.sendKeys(keys, this.DECISION_REPLY_MARKUP);
	}

	async sendKeys(keys, payload = {}) {
		for (const key of keys) {
			await this.sendKey(key, payload);
		}
		keys.length === 0 && (await this.send(this.RESPONSES.NO_KEYS_YET));
	}

	sendKey({ description, date, place, office }, payload = {}) {
		return this.send(
			util.format(
				this.RESPONSES.IS_THIS_THE_KEY,
				description,
				date,
				place,
				office
			),
			payload
		);
	}

	evaluateAnswer(query) {
		if (!this.isValid(query)) return;
		const { message: { text }, data } = query;

		switch (data.toLowerCase()) {
			case this.MESSAGES.LIST_ONE_UNANSWERED: {
				this.emit('memory:list:one:unanswered');
				break;
			}
			case this.MESSAGES.LIST_UNANSWERED: {
				this.emit('memory:list:unanswered');
				break;
			}
			case this.MESSAGES.LIST_POTENTIALS: {
				this.emit('memory:list:potential');
				break;
			}
			case this.MESSAGES.LIST_REJECTED: {
				this.emit('memory:list:rejected');
				break;
			}
			case this.MESSAGES.MARK_REJECT: {
				this.emit('memory:answer', text, 'NO');
				break;
			}
			case this.MESSAGES.MARK_POTENTIAL: {
				this.emit('memory:answer', text, 'POTENTIAL');
				break;
			}
			default: {
				this.send(this.RESPONSES.DUNNO);
			}
		}
	}

	sendError({ message }) {
		message =
			message === 'stillCrawling'
				? 'Please be patient... I am still crawling for you 😎'
				: 'Ups, something went wrong. Sorry 😇';
		return this.bot.sendMessage(this.CHAT_ID, message);
	}

	send(message, payload) {
		return this.bot.sendMessage(this.CHAT_ID, message, payload);
	}

	isValid({ from }) {
		return from.id === this.CHAT_ID;
	}

	get GENERIC_REPLY_MARKUP() {
		return {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: 'Show one unanswered',
							callback_data: 'list:one:unanswered'
						},
						{ text: 'Show unanswered', callback_data: 'list:unanswered' },
						{ text: 'Show potentials', callback_data: 'list:potentials' },
						{ text: 'Show rejected', callback_data: 'list:rejected' }
					]
				]
			}
		};
	}

	get DECISION_REPLY_MARKUP() {
		return {
			reply_markup: {
				inline_keyboard: [
					[
						{ text: 'Reject', callback_data: 'mark:reject' },
						{ text: 'Maybe', callback_data: 'mark:potential' }
					]
				]
			}
		};
	}

	get CHAT_ID() {
		return +config.TELEGRAM_CHAT_ID;
	}

	get RESPONSES() {
		return RESPONSES;
	}

	get MESSAGES() {
		return MESSAGES;
	}

	static getReady() {
		return new Bot(config.TELEGRAM_API_TOKEN);
	}
};
