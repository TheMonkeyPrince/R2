import type { VoiceConnection } from "@discordjs/voice";
import type { VoiceChannel } from "discord.js";

export interface SoundboardChannel {
  guildId: string;
  guildName: string;
  guildIcon: string;
  channelId: string;
  channelName: string;
}

export interface SoundBoardConnection {
  voiceConnection: VoiceConnection;
  voiceChannel: VoiceChannel
}