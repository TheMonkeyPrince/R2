import { SlashCommandBuilder } from "discord.js";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";
import { Soundboard } from "../../modules/soundboard/soundboard.js";
import { SOUNDBOARD_ORIGIN } from "../../env.js";

export default class ConnectSoundboard extends Command {
  override get data() {
    return new SlashCommandBuilder()
      .setName("soundboard")
      .setDescription("Connect the bot to your current voice channel");
  }

  override async execute(_bot: Bot, interaction: Interaction) {
    if (interaction.guild === null) return;

    // @ts-ignore
    const voiceChannel: VoiceChannel = interaction.member.voice.channel;
    if (voiceChannel === null) {
      interaction.reply("Please join a voice channel first.");
      return;
    }

    interaction.reply(`Connecting to ${voiceChannel.name}, you can access the soundboard panel at ${SOUNDBOARD_ORIGIN}`);
    Soundboard.instance.connectVoiceChannel(voiceChannel);
  }
}
