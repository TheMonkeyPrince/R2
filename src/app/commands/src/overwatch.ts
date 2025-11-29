import { SlashCommandBuilder } from "discord.js";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";

const IMG = "https://cdn.discordapp.com/attachments/682155089124917255/1192575566524731533/OVERWATCH_PROPAGANDA.png"

export default class Overwatch extends Command {
	override get data() {
		return new SlashCommandBuilder()
			.setName('overwatch')
			.setDescription('I want you')
			.addUserOption(option => 
				option.setName("pgm")
					.setDescription("Qui appeler à la rescousse ?")
					.setRequired(true)
			)
	}

	override async execute(_bot: Bot, interaction: Interaction) {
		const pgm = interaction.options.getUser("pgm", true)
		interaction.reply(`${IMG} <@${pgm.id}>`)
	}
}