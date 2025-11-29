import type { SoundboardChannel } from "@/types/soundboard-channel";
import { wsEvents } from "../event";

export enum MessageType {
  ChannelList = "ChannelList",
  DisonnectChannel = "DisonnectChannel",
  PlaySound = "PlaySound",
  StopSound = "StopSound",
  AddSound = "AddSound",
  EditSound = "EditSound",
  DeleteSound = "DeleteSound",
}

const ws = new WebSocket("/ws");

ws.onmessage = (event) => {
  console.log(event.data);
  const msg = JSON.parse(event.data);

  switch (msg.type) {
    case MessageType.ChannelList:
      wsEvents.emit(MessageType.ChannelList, msg.channels);
      break;

    case MessageType.PlaySound:
      wsEvents.emit(MessageType.PlaySound, msg.soundId);
      break;

    case MessageType.StopSound:
      wsEvents.emit(MessageType.StopSound, null);
      break;

    case MessageType.AddSound:
      wsEvents.emit(MessageType.AddSound, msg.sound);
      break;

    case MessageType.EditSound:
      wsEvents.emit(MessageType.EditSound, msg.sound);
      break;

    case MessageType.DeleteSound:
      wsEvents.emit(MessageType.DeleteSound, msg.soundId);
      break;
  }
};

ws.onerror = (err) => {
  console.error("WebSocket error:", err);
};

ws.onclose = () => {
  console.log("WebSocket connection closed");
};

export function playSound(soundId: number) {
  ws.send(
    JSON.stringify({
      type: MessageType.PlaySound,
      soundId,
    })
  );
}

export function stopSound() {
  ws.send(
    JSON.stringify({
      type: MessageType.StopSound,
    })
  );
}

export function disconnectChannel(soundboardChannel: SoundboardChannel) {
  ws.send(
    JSON.stringify({
      type: MessageType.DisonnectChannel,
      guildId: soundboardChannel.guildId,
      channelId: soundboardChannel.channelId,
    })
  );
}
