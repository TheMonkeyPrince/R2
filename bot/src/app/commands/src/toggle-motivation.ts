import { MessageFlags, SlashCommandBuilder, TextChannel } from "discord.js";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";
import { prisma } from "../../db.js";
import { JobTag } from "../../../generated/prisma/enums.js";
import { createMotivationalJob, type MotivationalJobPayload } from "../../modules/job-scheduler/jobs/daily-motivation.js";

export default class ToggleMotivation extends Command {
	override get data() {
		return new SlashCommandBuilder()
			.setName('toggle-motivation')
			.setDescription('Toggle daily motivational quotes in this channel')
	}

	override async execute(_bot: Bot, interaction: Interaction) {
		if (interaction.guild === null) return
		const commandChannel = interaction.channel;
		if (!(commandChannel instanceof TextChannel)) return

		let motivationalJob = await prisma.scheduledJob.findFirst({
			where: {
				tag: JobTag.DAILY_MOTIVATIONAL_QUOTE
			}
		});

		if (!motivationalJob) {
			motivationalJob = await createMotivationalJob([{
				channelId: commandChannel.id,
				guildId: commandChannel.guild.id
			}])
			interaction.reply({ content: `Daily motivational quotes have been enabled in this channel.`, flags: MessageFlags.Ephemeral });
			return;
		}

		const payload = JSON.parse(motivationalJob.payload) as MotivationalJobPayload;
		let enabled = false;
		if (payload.subscribedChannels.some(c => c.channelId === commandChannel.id && c.guildId === commandChannel.guild.id)) {
			payload.subscribedChannels = payload.subscribedChannels.filter(c => !(c.channelId === commandChannel.id && c.guildId === commandChannel.guild.id));
		} else {
			payload.subscribedChannels.push({
				channelId: commandChannel.id,
				guildId: commandChannel.guild.id
			});
			enabled = true;
		}

		await prisma.scheduledJob.update({
			where: {
				id: motivationalJob.id
			},
			data: {
				payload: JSON.stringify(payload)
			}
		});

		interaction.reply({ content: `Daily motivational quotes have been ${enabled ? 'enabled' : 'disabled'} in this channel.`, flags: MessageFlags.Ephemeral });
	}
}

