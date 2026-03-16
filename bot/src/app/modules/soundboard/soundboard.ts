import {
  createAudioPlayer,
  entersState,
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

  static get name(): string {
    return "Soundboard";
  }

  constructor(bot: Bot) {
    super(bot);
    Soundboard.instance = this;

    this.voiceRecorder = new VoiceRecorder({
      maxUserRecordingLength: 100, // 10 MB;
      maxRecordTimeMinutes: 10, // 10 minutes
      sampleRate: 48_000
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
    let origin = SOUNDBOARD_ORIGIN;
    // if no port set and origin is https, add port 443, otherwise add port 80
    if (!origin.includes(":") && origin.startsWith("https://")) {
      origin += ":443";
    } else if (!origin.includes(":") && origin.startsWith("http://")) {
      origin += ":80";
    }
    app.use(
      cors({
        origin: origin,
      })
    );


    // app.use(express.static("soundboard-panel/dist"));
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
    const connection = joinVoiceChannel({
      channelId: target.id,
      guildId: target.guild.id,
      adapterCreator: target.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });

    connection.subscribe(this.audioPlayer);

    const guild = target.guild;
    let connectedChannel: VoiceChannel | null = null;

    connection.on(VoiceConnectionStatus.Ready, async () => {
      const newConnectedChannel = await guild.channels.fetch(connection.joinConfig.channelId!) as VoiceChannel;
      if (connectedChannel && connectedChannel.id === newConnectedChannel.id) {
        logger.debug("[Ready] Reconnected to same channel, that's weird. Disconnecting...");
        this.disconnectFromGuild(guild.id);
        return;
      }

      connectedChannel = newConnectedChannel;
      logger.debug(`[Ready] Connected to voice channel: ${connectedChannel.name}`);

      this.channelMap.set(guild, {
        voiceConnection: connection,
        voiceChannel: connectedChannel!
      })
      this.soundboardSocketServer.updateChannelList(this.channels);

      this.voiceRecorder.startRecording(connection);
    });


    connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 1_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 1_000),
          entersState(connection, VoiceConnectionStatus.Ready, 1_000),
        ]);
        // Seems to be reconnecting to a new channel - ignore disconnect
        if (connection.joinConfig.channelId !== connectedChannel?.id) { // Channel switch
          logger.debug(`[Channel Switch] Disconnected from ${connectedChannel?.name || "Unknown"}, connecting to new channel...`);
        } else {
          logger.debug(`[Reconnecting] Attempting to reconnect to voice channel: ${connectedChannel?.name || "Unknown"}`);
        }
      } catch {
        // Seems to be a real disconnect which SHOULDN'T be recovered from
        logger.debug(`[Disconnected] Disconnected from voice channel: ${connectedChannel?.name || "Unknown"}`);
        this.disconnectFromGuild(guild.id);
      }
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
