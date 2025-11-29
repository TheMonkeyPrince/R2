import { Client } from "discord.js";

import intents from "../lib/discord-intents.js";

import CommandHandler from "./commands/command-handler.js"
// import EventHandler from "./EventHandler"

export default class Bot {

	public readonly client: Client
    public readonly commandHandler: CommandHandler
    // public readonly eventHandler: EventHandler

	constructor() {

		const client = new Client({ intents: intents });
		this.client = client
		
		this.commandHandler = new CommandHandler(this)
		// this.eventHandler = new EventHandler(this)
	}

	public login(token: string) {
		this.client.login(token)
	}

	public disconnect() {
		this.client.destroy()
	}
}