import { MessageFlags, SlashCommandBuilder, TextChannel } from "discord.js";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";

export default class Rename extends Command {
	override get data() {
		return new SlashCommandBuilder()
			.setName('rename')
			.setDescription('Rename someone')
			.addUserOption(option =>
				option.setName("target")
					.setDescription("The target")
					.setRequired(true)
			)
			.addStringOption(option =>
				option.setName("name")
					.setDescription("The new name")
					.setRequired(true)
			)
	}

	override async execute(_bot: Bot, interaction: Interaction) {
		const target = interaction.options.getUser("target", true)
		const newName = interaction.options.getString("name", true)
		const channel = interaction.channel
		if (channel instanceof TextChannel) {
			const targetMember = await channel.guild.members.fetch(target.id)
			targetMember.setNickname(newName).then(() => {
				interaction.reply({ content: "Name modified !", flags: MessageFlags.Ephemeral })
			}).catch(() => {
				interaction.reply({ content: "Missing permissions !", flags: MessageFlags.Ephemeral })
			})	
		}
	}
}