import { AttachmentBuilder, SlashCommandBuilder, TextChannel } from "discord.js";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";
import { Soundboard } from "../../modules/soundboard/soundboard.js";

export default class Record extends Command {
	override get data() {
		return new SlashCommandBuilder()
			.setName("record")
			.setDescription("Record audio from your current voice channel")
			.addBooleanOption((option) =>
				option.setName('zip').setDescription('Get a zip with a file for each user (default: no)').setRequired(false),
			);
	}

	override async execute(_bot: Bot, interaction: Interaction) {
		if (interaction.guild === null) return;

		const zip = interaction.options.getBoolean('zip') ?? false;

		const commandChannel = interaction.channel;
		if (!(commandChannel instanceof TextChannel)) {
			return
		}

		// @ts-ignore
		const voiceChannel: VoiceChannel = interaction.member.voice.channel;
		if (voiceChannel === null) {
			interaction.reply("Please join a voice channel first.");
			return;
		}

		const voiceConnection = Soundboard.instance.channelList.get(voiceChannel)?.[0];
		if (!voiceConnection) {
			interaction.reply("The bot is not connected to your voice channel. Please use /soundboard to connect first.");
			return;
		}

		await interaction.deferReply();

		let attachment;
		if (zip) {
			const stream = await Soundboard.instance.voiceRecorder.getRecordedVoiceAsBuffer(commandChannel.guildId, "separate", 5)
			attachment = new AttachmentBuilder(stream, {
				name: 'record.zip'
			});
		} else {
			const stream = await Soundboard.instance.voiceRecorder.getRecordedVoiceAsBuffer(commandChannel.guildId, "single", 5)
			attachment = new AttachmentBuilder(stream, {
				name: 'records.mp3'
			});
		}

		interaction.editReply({
			content: "Here is your recording:",
			files: [attachment]
		});

	}
}
