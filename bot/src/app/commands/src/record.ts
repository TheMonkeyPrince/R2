import { AttachmentBuilder, SlashCommandBuilder, TextChannel } from "discord.js";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";
import { Soundboard } from "../../modules/soundboard/soundboard.js";
import { AudioExportType } from "../../../lib/discordjs-voice-recorder/types.js";
import logger from "../../logger.js";

export default class Record extends Command {
	override get data() {
		return new SlashCommandBuilder()
			.setName("record")
			.setDescription("Record audio from your current voice channel")
			.addStringOption(option =>
				option.setName("duration")
				.setDescription("Duration to record (e.g., '10s' for 10 seconds, '2m' for 2 minutes). Default is 1 minute.")
				.setRequired(false)
			);
	}

	override async execute(_bot: Bot, interaction: Interaction) {
		if (interaction.guild === null) return;

		const durationInMinutes = parseDuration(interaction.options.getString("duration") ?? "1m");
		if (!durationInMinutes) {
			interaction.reply("Invalid duration format. Please use formats like '10s' for 10 seconds or '2m' for 2 minutes.");
			return;
		}

		const commandChannel = interaction.channel;
		if (!(commandChannel instanceof TextChannel)) {
			return
		}

		const soundBoardConnection = Soundboard.instance.channelMap.get(interaction.guild);
		if (!soundBoardConnection) {
			interaction.reply("The bot is not connected to your voice channel. Please use /soundboard to connect first.");
			return;
		}

		// banana(soundBoardConnection.voiceConnection, interaction.member!.user.id);
		// interaction.reply(`Started recording your audio for up to ${durationInMinutes} minute(s).`);

		await interaction.deferReply();

		logger.debug(`Getting last ${durationInMinutes} recorded minute(s) in guild ${interaction.guild.name}`);


		const mp3Attachment = new AttachmentBuilder(
			await Soundboard.instance.voiceRecorder.getRecordedVoiceAsBuffer(commandChannel.guildId, AudioExportType.SINGLE, durationInMinutes), {
			name: 'record.mp3'
		});

		const zipAttachment = new AttachmentBuilder(
			await Soundboard.instance.voiceRecorder.getRecordedVoiceAsBuffer(commandChannel.guildId, AudioExportType.SEPARATE, durationInMinutes), {
			name: 'records.zip'
		});

		interaction.editReply({
			content: "Here is your recording:",
			files: [mp3Attachment, zipAttachment]
		});

	}
}

/**
 * Parses a duration string containing **either** seconds or minutes.
 * Supported forms:
 *   "10s", "45s"
 *   "2m", "15m"
 *
 * Returns duration in minutes.
 * Returns 0 on invalid or mixed expressions.
 */
export function parseDuration(input: string): number {
  const trimmed = input.trim();

  // seconds
  if (/^\d+s$/.test(trimmed)) {
    const value = Number(trimmed.slice(0, -1));
    return value / 60;
  }

  // minutes
  if (/^\d+m$/.test(trimmed)) {
    const value = Number(trimmed.slice(0, -1));
    return value;
  }

  return 0;
}
