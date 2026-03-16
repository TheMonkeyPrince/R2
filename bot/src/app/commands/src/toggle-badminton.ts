import { MessageFlags, SlashCommandBuilder, TextChannel } from "discord.js";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";
import { prisma } from "../../db.js";
import { JobTag } from "../../../generated/prisma/enums.js";
import { createBadmintonReminderJob, type BadmintonReminderJobPayload } from "../../modules/job-scheduler/jobs/badminton-reminder.js";

export default class ToggleBadminton extends Command {
	override get data() {
		return new SlashCommandBuilder()
			.setName('toggle-badminton')
			.setDescription('Toggle badminton reminders in this channel')
	}

	override async execute(_bot: Bot, interaction: Interaction) {
		if (interaction.guild === null) return
		const commandChannel = interaction.channel;
		if (!(commandChannel instanceof TextChannel)) return

		let badmintonJob = await prisma.scheduledJob.findFirst({
			where: {
				tag: JobTag.SEND_BADMINTON_REMINDER
			}
		});

		if (!badmintonJob) {
			badmintonJob = await createBadmintonReminderJob([{
				channelId: commandChannel.id,
				guildId: commandChannel.guild.id
			}])
			interaction.reply({ content: `Badminton reminders have been enabled in this channel.`, flags: MessageFlags.Ephemeral });
			return;
		}

		const payload = JSON.parse(badmintonJob.payload) as BadmintonReminderJobPayload;
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
				id: badmintonJob.id
			},
			data: {
				payload: JSON.stringify(payload)
			}
		});

		interaction.reply({ content: `Badminton reminders have been ${enabled ? 'enabled' : 'disabled'} in this channel.`, flags: MessageFlags.Ephemeral });
	}
}

