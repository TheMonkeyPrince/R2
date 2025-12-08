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
import { SOUNDBOARD_ORIGIN, SOUNDBOARD_PORT } from "../../env.js";
import { Module } from "../module.js";
import type Bot from "../../bot.js";
import logger from "../../logger.js";
import { SoundBoardWebSocketServer } from "./ws-server.js";
import { soundsDir } from "./sound-upload.js";
import type { Guild, VoiceChannel } from "discord.js";
import type { SoundboardChannel, SoundBoardConnection } from "./soundboard-channel.js";
import { VoiceRecorder } from "../../../lib/discordjs-voice-recorder/voice-recorder.js";


export class Soundboard extends Module {
  public static instance: Soundboard;

  public readonly voiceRecorder: VoiceRecorder

  public readonly soundboardSocketServer: SoundBoardWebSocketServer;
  public readonly channelMap: Map<Guild, SoundBoardConnection> = new Map();

  public readonly audioPlayer: AudioPlayer;
  private readonly server: http.Server;

  constructor(bot: Bot) {
    super(bot, "Soundboard");
    Soundboard.instance = this;

    this.voiceRecorder = new VoiceRecorder({
      maxUserRecordingLength: 10, // 10 MB;
      maxRecordTimeMinutes: 10, // 10 minutes
      sampleRate: 48000
    }, bot.client);

    this.audioPlayer = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Stop,
      },
    });

    const app = express();

    logger.debug(
      `Enabling CORS for Soundboard module for origin: ${SOUNDBOARD_ORIGIN}`
    );
    app.use(
      cors({
        origin: SOUNDBOARD_ORIGIN,
      })
    );


    app.use(express.static("soundboard-panel/dist"));
    app.use("/api", soundboardRouter);

    logger.info(`Sounds directory: ${soundsDir}`);

    this.server = http.createServer(app);
    this.soundboardSocketServer = new SoundBoardWebSocketServer(
      this.server,
      this.audioPlayer
    );
  }

  async start() {
    const port = SOUNDBOARD_PORT;
    this.server.listen(port, () => {
      logger.info(`SoundBoard module started on http://localhost:${port}`);
    });
  }

  async connectToVoiceChannel(target: VoiceChannel) {
    const oldConnection = this.channelMap.get(target.guild);
    if (oldConnection) {
      logger.debug(
        `Already connected to a voice channel in guild ${target.guild.name}, disconnecting from the old channel first.`
      );
      await this.disconnectFromGuild(target.guild.id);
    }

    const connection = joinVoiceChannel({
      channelId: target.id,
      guildId: target.guild.id,
      adapterCreator: target.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });

    const guild = target.guild;
    let connectedChannel: VoiceChannel | null = null;

    connection.on(VoiceConnectionStatus.Ready, async () => {
      if (connectedChannel) return; // Already connected
      connectedChannel = await guild.channels.fetch(connection.joinConfig.channelId!) as VoiceChannel;
      connection.joinConfig.channelId = ""; // Prevents reconnection attempts
      logger.debug(`[Ready] Connected to voice channel: ${connectedChannel!.name}`);

      connection.subscribe(this.audioPlayer);

      this.channelMap.set(guild, {
        voiceConnection: connection,
        voiceChannel: connectedChannel!
      })
      this.soundboardSocketServer.updateChannelList(this.channels);

      this.voiceRecorder.startRecording(connection);
    });

    connection.on(VoiceConnectionStatus.Disconnected, () => {
      if (connectedChannel) {
        logger.debug(`[Disconnected] Disconnected from voice channel: ${connectedChannel.name}`);
      } else {
        logger.debug(`[Disconnected] Disconnected from voice channel: Unknown`);
      }
      connectedChannel = null;
      this.disconnectFromGuild(guild.id);
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      connectedChannel = null;
      logger.debug(`[Disconnected] Voice connection destroyed`);
      this.disconnectFromGuild(guild.id);
    });

    connection.on(VoiceConnectionStatus.Signalling, () => {
      connectedChannel = null;
      logger.debug(`[Signalling] Voice connection signalling`);
      this.disconnectFromGuild(guild.id);
    });
  }

  async disconnectFromGuild(guildId: string) {
    const guild = await this.bot.client.guilds.fetch(guildId);
    const connectionInfo = this.channelMap.get(guild);
    if (!connectionInfo) return;

    this.voiceRecorder.stopRecording(connectionInfo.voiceConnection);
    connectionInfo.voiceConnection.removeAllListeners();
    connectionInfo.voiceConnection.destroy();

    this.channelMap.delete(guild);
    this.soundboardSocketServer.updateChannelList(this.channels);
  }

  get channels(): SoundboardChannel[] {
    return Array.from(this.channelMap.values()).map(connectionInfo => {
      const channel = connectionInfo.voiceChannel;
      return {
        guildId: channel.guild.id,
        guildName: channel.guild.name,
        guildIcon:
          channel.guild.iconURL({
            extension: "png",
          }) || "",
        channelId: channel.id,
        channelName: channel.name,
      };
    });
  }
}
