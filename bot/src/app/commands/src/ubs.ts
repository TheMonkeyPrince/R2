import { SlashCommandBuilder, TextChannel } from "discord.js";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";
import DefaultEmbed from "../../../lib/default-embed.js";

export default class UBS extends Command {
	override get data() {
		return new SlashCommandBuilder()
			.setName('ubs')
			.setDescription('Register a new transaction')
			.addUserOption(option =>
				option.setName("sending_monkey")
					.setDescription("The monkey that must pay")
					.setRequired(true)
			)
			.addUserOption(option =>
				option.setName("receiving_monkey")
					.setDescription("The monkey receiving")
					.setRequired(true)
			)
			.addIntegerOption(option =>
				option.setName("amount")
					.setDescription("1-999999 (we prevent int overflow like proper cs monkeys :insert sunglass emoji: ")
					.setMinValue(1).setMaxValue(999999)
					.setRequired(true)
			)
			.addStringOption(option =>
				option.setName("unit")
					.setDescription("Unit of payment: could be bananas, grams of cocaine, barrels of oil, ram sticks...")
					.setRequired(true)
			)
			.addStringOption(option =>
				option.setName("reason")
					.setDescription("Why ?")
					.setRequired(true)
			)
	}

	override async execute(_bot: Bot, interaction: Interaction) {
		if (interaction.guild === null) return
		const channel = interaction.channel;
		if (channel instanceof TextChannel) {
			const sending_monkey = interaction.options.getUser("sending_monkey", true)
			const receiving_monkey = interaction.options.getUser("receiving_monkey", true)
			const amount = interaction.options.getInteger("amount", true)
			const unit = interaction.options.getString("unit", true)
			const reason = interaction.options.getString("reason", true)

			const guild = channel.guild;

			const embed = new DefaultEmbed()
			embed
				.setAuthor({
					name: interaction.user.displayName,
					iconURL: interaction.user.avatarURL() ?? "",
				})
				.setTitle("New pending transaction registered :bank:")
				.addFields([
					{
						name: "Sending Monkey",
						value: (await guild.members.fetch(sending_monkey)).displayName + ` (id: ${sending_monkey})`
					},
					{
						name: "Receiving Monkey",
						value: (await guild.members.fetch(receiving_monkey)).displayName + ` (id: ${receiving_monkey})`
					},
					{
						name: "Merchandise",
						value: `${amount} ${unit}`,
						inline: true
					},
					{
						name: "Reason",
						value: reason
					}
				])
				.setFooter({ text: 'Union des Banques Simiennes, presque codé par le sublime Athanaze', iconURL: guild.iconURL() ?? "" });

			interaction.reply({ embeds: [embed] })
		}
	}
}
