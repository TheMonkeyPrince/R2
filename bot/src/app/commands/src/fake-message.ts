import { MessageFlags, SlashCommandBuilder, TextChannel } from "discord.js";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";
import sendWebhookMessageToChannel from "../../../lib/webwook-message.js";

export default class FakeMessage extends Command {
  override get data() {
    return new SlashCommandBuilder()
      .setName("fakemessage")
      .setDescription("Send a fake message as another user")
      .addUserOption((option) =>
        option.setName("target").setDescription("Target user").setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("message")
          .setDescription("Your message")
          .setRequired(true)
      );
  }

  override async execute(_bot: Bot, interaction: Interaction) {
    const targetUser = interaction.options.getUser("target", true);
    const message = interaction.options.getString("message", true);
    const channel = interaction.channel;

    if (channel instanceof TextChannel) {
      const targetMember = await channel.guild.members.fetch(targetUser.id);
      sendWebhookMessageToChannel(
        channel,
        targetMember.nickname ?? targetMember.displayName,
        targetMember.avatarURL() ?? targetMember.user.avatarURL() ?? "",
        message
      ).then(() => {
        interaction.reply({
          content: "Message sent",
          flags: MessageFlags.Ephemeral,
        });
      });
    }
  }
}
