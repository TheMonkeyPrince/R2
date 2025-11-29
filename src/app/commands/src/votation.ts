import { SlashCommandBuilder, TextChannel } from "discord.js";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";
import DefaultEmbed from "../../../lib/default-embed.js";

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array: string[]) {
	for (var i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = array[i];
		array[i] = array[j]!;
		array[j] = temp!;
	}
}

function generateVoteFieldEntry(emoji: string, vote: string) {
	return { name: emoji + " -> " + vote, value: "\u200B" };
}

function generateEmbedFields(
	emojis: string[],
	choice1: string,
	choice2: string,
	choice3: string | null,
	choice4: string | null
) {
	const fields = [];
	fields.push(generateVoteFieldEntry(emojis[0]!, choice1));
	fields.push(generateVoteFieldEntry(emojis[1]!, choice2));
	if (choice3) {
		fields.push(generateVoteFieldEntry(emojis[2]!, choice3));
	}
	if (choice4) {
		fields.push(generateVoteFieldEntry(emojis[3]!, choice4));
	}
	return fields;
}

export default class Votation extends Command {
	override get data() {
		return new SlashCommandBuilder()
			.setName("votation")
			.setDescription("Faire un vote populaire")
			.addStringOption((option) =>
				option
					.setName("description")
					.setDescription("Description de la votation")
					.setRequired(true)
			)
			.addStringOption((option) =>
				option
					.setName("choice_1")
					.setDescription("Choix 1 (requis)")
					.setRequired(true)
			)
			.addStringOption((option) =>
				option
					.setName("choice_2")
					.setDescription("Choix 2 (requis)")
					.setRequired(true)
			)
			.addStringOption((option) =>
				option
					.setName("choice_3")
					.setDescription("Choix 3 (optionnel)")
					.setRequired(false)
			)
			.addStringOption((option) =>
				option
					.setName("choice_4")
					.setDescription("Choix 4 (optionnel)")
					.setRequired(false)
			);
	}

	override async execute(bot: Bot, interaction: Interaction) {
		const channel = interaction.channel;
		if (channel instanceof TextChannel) {
			const description = interaction.options.getString("description", true);
			const choice1 = interaction.options.getString("choice_1", true);
			const choice2 = interaction.options.getString("choice_2", true);
			const choice3 = interaction.options.getString("choice_3");
			const choice4 = interaction.options.getString("choice_4");

			const emojis = ["🐒", "🐵", "🚀", "💪"];
			interaction.guild?.emojis.cache.forEach((emoji) => {
				if (emoji.animated) {
					emojis.push("<" + emoji.identifier + ">");
				} else {
					emojis.push("<:" + emoji.identifier + ">");
				}
			});
			shuffleArray(emojis);

			const embed = new DefaultEmbed()
				.setAuthor({
					name: interaction.user.displayName,
					iconURL: interaction.user.avatarURL() ?? "",
				})
				.setTitle("Nouvelle votation :flag_ch:")
				.setDescription(description)
				.addFields(
					generateEmbedFields(emojis, choice1, choice2, choice3, choice4)
				)
				.setFooter({
					text: interaction.guild?.name as string,
					iconURL: channel.guild.iconURL() ?? "",
				});


			interaction.reply({ embeds: [embed], withResponse: true }).then((reply) => {
				reply.resource?.message?.react(emojis[0]!);
				reply.resource?.message?.react(emojis[1]!);
				if (choice3) {
					reply.resource?.message?.react(emojis[2]!);
				}
				if (choice4) {
					reply.resource?.message?.react(emojis[3]!);
				}
			});
		}
	}
}
