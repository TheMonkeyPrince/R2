import {
  createAudioPlayer,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnection,
  VoiceConnectionStatus,
  type AudioPlayer,
} from "@discordjs/voice";

import http from "http";
import express from "express";
import cors from "cors";

import soundboardRouter from "./http-server.js";
import { NODE_ENV, DEV_SOUNDBOARD_ORIGIN, SOUNDBOARD_PORT } from "../../env.js";
import { Module } from "../module.js";
import type Bot from "../../bot.js";
import logger from "../../logger.js";
import { SoundBoardWebSocketServer } from "./ws-server.js";
import { soundsDir } from "./sound-upload.js";
import type { VoiceChannel } from "discord.js";
import type { SoundboardChannel } from "./soundboard-channel.js";
import { channel } from "diagnostics_channel";

export class Soundboard extends Module {
  public static instance: Soundboard;

  public readonly soundboardSocketServer: SoundBoardWebSocketServer;
  public readonly channelList: Map<
    VoiceChannel,
    [VoiceConnection, SoundboardChannel]
  > = new Map();

  public readonly audioPlayer: AudioPlayer;
  private readonly server: http.Server;

  constructor(bot: Bot) {
    super(bot, "Soundboard");
    Soundboard.instance = this;

    this.audioPlayer = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Stop,
      },
    });

    const app = express();

    if (NODE_ENV === "development") {
      logger.debug(
        `Enabling CORS for Soundboard module for origin: ${DEV_SOUNDBOARD_ORIGIN}`
      );
      app.use(
        cors({
          origin: DEV_SOUNDBOARD_ORIGIN,
        })
      );
    }

    app.use(express.static("soundboard-panel/dist"));
    app.use("/api", soundboardRouter);

    logger.info(`Sounds directory: ${soundsDir}`);

    this.server = http.createServer(app);
    this.soundboardSocketServer = new SoundBoardWebSocketServer(
      this.server,
      this.audioPlayer
    );
  }

  start() {
    const port = SOUNDBOARD_PORT;
    this.server.listen(port, () => {
      logger.info(`SoundBoard module started on http://localhost:${port}`);
    });
  }

  connectVoiceChannel(voiceChannel: VoiceChannel) {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
      logger.debug(
        `Soundboard connected to voice channel: ${voiceChannel.name}`
      );
      connection.subscribe(this.audioPlayer);

      const soundboardChannel: SoundboardChannel = {
        guildId: voiceChannel.guild.id,
        guildName: voiceChannel.guild.name,
        channelId: voiceChannel.id,
        channelName: voiceChannel.name,
        guildIcon:
          voiceChannel.guild.iconURL({
            extension: "png",
          }) || "",
      };

      this.channelList.set(voiceChannel, [connection, soundboardChannel]);
      this.soundboardSocketServer.updateChannelList(this.channels);
    });

    connection.on(VoiceConnectionStatus.Disconnected, () => {
      logger.debug(
        `Soundboard disconnected from voice channel: ${voiceChannel.name}`
      );

      this.channelList.delete(voiceChannel);
      this.soundboardSocketServer.updateChannelList(this.channels);
    });
  }

  disconnectVoiceChannel(guildId: string, channelId: string) {
    const voiceChannel = this.bot.client.guilds.cache
      .get(guildId)
      ?.channels.cache.get(channelId) as VoiceChannel | undefined;

    if (voiceChannel) {
      this.channelList.get(voiceChannel)?.[0].disconnect();
    }
  }

  get channels(): SoundboardChannel[] {
    return Array.from(this.channelList.values()).map(([_, channel]) => channel);
  }
}
