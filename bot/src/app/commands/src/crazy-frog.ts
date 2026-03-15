import {
  GuildMember,
  MessageFlags,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";
import sendWebhookMessageToChannel from "../../../lib/webwook-message.js";

const CRAZY_FROG =
  "<a:russian_frog_1:759387072967868486><a:russian_frog_2:759387073114931210><a:russian_frog_3:759387086104166451>";

export default class CrazyFrog extends Command {
  override get data() {
    return new SlashCommandBuilder()
      .setName("crazyfrog")
      .setDescription("TARATATATATATATATA");
  }

  override async execute(_bot: Bot, interaction: Interaction) {
    const channel = interaction.channel;

    if (channel instanceof TextChannel) {
      const targetMember = interaction.member! as GuildMember;
      sendWebhookMessageToChannel(
        channel,
        targetMember.nickname ?? targetMember.displayName,
        targetMember.avatarURL() ?? targetMember.user.avatarURL() ?? "",
        CRAZY_FROG
      ).then(() => {
        interaction.reply({
          content: "Message sent",
          flags: MessageFlags.Ephemeral,
        });
      });
    }
  }
}
