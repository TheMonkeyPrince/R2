import type Bot from "../bot.js";

export abstract class Module {
	protected readonly bot: Bot;
	
	constructor(bot: Bot) {
		this.bot = bot;
	}

	abstract start(): Promise<void>;

	static get name(): string {
		throw new Error("Module name not defined");
	}
}