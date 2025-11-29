import { Client } from "discord.js";

import intents from "../lib/discord-intents.js";

import CommandHandler from "./commands/command-handler.js"
import logger from "./logger.js";

export default class Bot {

	public readonly client: Client
	public readonly commandHandler: CommandHandler

	constructor() {

		const client = new Client({ intents: intents });
		this.client = client

		this.commandHandler = new CommandHandler(this)

		client.once("ready", () => {
			logger.info(`Logged in as ${client.user?.tag}`)
		})

	}

	public login(token: string) {

		this.client.login(token)
	}

	public disconnect() {
		this.client.destroy()
	}
}