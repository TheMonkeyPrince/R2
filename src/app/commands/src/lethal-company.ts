import { SlashCommandBuilder } from "discord.js";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";

const IMG = "https://cdn.discordapp.com/attachments/552919298243297354/1192590537845383218/image.png"

export default class LethalCompany extends Command {
	override get data() {
		return new SlashCommandBuilder()
			.setName('lethalcompany')
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