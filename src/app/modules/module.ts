import type Bot from "../bot.js";

export abstract class Module {
	protected readonly bot: Bot;
	protected readonly name: string;
	
	constructor(bot: Bot, name: string) {
		this.bot = bot;
		this.name = name;
	}

	abstract start(): void;
}