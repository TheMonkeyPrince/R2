import { SlashCommandBuilder } from "discord.js";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";

export default class Ping extends Command {
	override get data() {
		return new SlashCommandBuilder()
			.setName('ping')
			.setDescription('Reply with pong')
	}

	override async execute(_bot: Bot, interaction: Interaction) {
		if (interaction.guild === null) return
		interaction.reply("pong")
	}
}
