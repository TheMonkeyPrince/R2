import { WebSocket, WebSocketServer } from "ws";
import http from "http";
import path from "path";
import { createAudioResource, type AudioPlayer } from "@discordjs/voice";

import { prisma } from "../../db.js";
import type { Sound } from "../../../generated/prisma/client.js";
import { soundsDir } from "./sound-upload.js";
import logger from "../../logger.js";
import type { SoundboardChannel } from "./soundboard-channel.js";
import { Soundboard } from "./soundboard.js";

enum MessageType {
  ChannelList = "ChannelList",
  DisonnectChannel = "DisonnectChannel",
  PlaySound = "PlaySound",
  StopSound = "StopSound",
  AddSound = "AddSound",
  EditSound = "EditSound",
  DeleteSound = "DeleteSound",
}

export class SoundBoardWebSocketServer {
  private readonly wss: WebSocketServer;

  constructor(httpServer: http.Server, audioPlayer: AudioPlayer) {
    this.wss = new WebSocketServer({
      server: httpServer,
      path: "/ws",
    });

    const self = this;
    this.wss.on("connection", (ws) => {
      this.sendMessage(ws, {
        type: MessageType.ChannelList,
        channels: Soundboard.instance.channels,
      });

      ws.on("error", logger.error);

      ws.on("message", async function message(data) {
        logger.debug(`Received: ${data}`);
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case MessageType.DisonnectChannel:
            if (message.guildId && message.channelId) {
              Soundboard.instance.disconnectVoiceChannel(
                message.guildId,
                message.channelId
              );
            }

          case MessageType.PlaySound:
            if (message.soundId) {
              const sound = await prisma.sound.findUnique({
                where: { id: Number(message.soundId) },
              });
              if (sound) {
                logger.debug(`Playing sound ${sound.id}...`);

                const resource = createAudioResource(
                  path.join(soundsDir, sound.filename)
                );
                audioPlayer.play(resource);
                self.playSound(sound.id.toString());
              }
            }
            break;
          case MessageType.StopSound:
            audioPlayer.stop();
            self.stopSound();
            break;
          default:
            logger.warn(`Unknown message type: ${message.type}`);
            break;
        }
      });
    });
  }

  private sendMessage(client: WebSocket, message: any) {
    client.send(JSON.stringify(message));
  }

  private broadcast(message: any) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        this.sendMessage(client, message);
      }
    });
  }

  private playSound(soundId: string) {
    this.broadcast({
      type: MessageType.PlaySound,
      soundId,
    });
  }

  private stopSound() {
    this.broadcast({
      type: MessageType.StopSound,
    });
  }

  addSound(sound: Sound) {
    this.broadcast({
      type: MessageType.AddSound,
      sound,
    });
  }

  editSound(sound: Sound) {
    this.broadcast({
      type: MessageType.EditSound,
      sound,
    });
  }

  deleteSound(soundId: number) {
    this.broadcast({
      type: MessageType.DeleteSound,
      soundId,
    });
  }

  updateChannelList(channels: SoundboardChannel[]) {
    this.broadcast({
      type: MessageType.ChannelList,
      channels,
    });
  }
}
