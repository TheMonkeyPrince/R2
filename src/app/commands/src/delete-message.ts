import { SlashCommandBuilder, TextChannel } from "discord.js";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";

export default class DeleteMessage extends Command {
  override get data() {
    return new SlashCommandBuilder()
      .setName("delete")
      .setDescription("Delete a message")
      .addChannelOption((opt) =>
        opt.setName("channel").setDescription("The channel").setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("message")
          .setDescription("The message id")
          .setRequired(true)
      );
  }

  override async execute(_bot: Bot, interaction: Interaction) {
    const channel = interaction.options.getChannel("channel", true);
    const messageId = interaction.options.getString("message", true);

    const commandChannel = interaction.channel;
    if (commandChannel instanceof TextChannel) {
      if (channel instanceof TextChannel)
        channel.messages.fetch(messageId).then((message) => {
          message.delete().then(() => {
            interaction.reply({
              content: "Message deleted !",
              ephemeral: true,
            });
          });
        });
      else interaction.reply({ content: "Not a channel", ephemeral: true });
    }
  }
}
