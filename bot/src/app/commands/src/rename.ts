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
			.addStringOption(option =>
				option.setName("lore")
					.setDescription("Explanation for this rename")
					.setRequired(true)
			)
	}

	override async execute(_bot: Bot, interaction: Interaction) {
		const target = interaction.options.getUser("target", true)
		const newName = interaction.options.getString("name", true).slice(0, 31) // Discord nickname limit is 32 characters, we take 31 to be safe
		const lore = interaction.options.getString("lore", true)
		const channel = interaction.channel
		if (channel instanceof TextChannel) {
			const targetMember = await channel.guild.members.fetch(target.id)
    		const oldName = targetMember.nickname || target.displayName; 
    		const executorName = interaction.member.displayName;
			targetMember.setNickname(newName).then(() => {
				interaction.reply(`**${executorName}** renamed **${oldName}** → **${newName}**!\n Lore: *${lore}*`)
			}).catch(() => {
				interaction.reply({ content: "Missing permissions !", flags: MessageFlags.Ephemeral })
			})
		}
	}
}