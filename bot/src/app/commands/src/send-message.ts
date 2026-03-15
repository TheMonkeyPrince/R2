import { MessageFlags, SlashCommandBuilder, TextChannel } from "discord.js";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";

export default class SendMessage extends Command {
  override get data() {
    return new SlashCommandBuilder()
      .setName("send")
      .setDescription("Send a message")
      .addStringOption((option) =>
        option
          .setName("message")
          .setDescription("A nice message")
          .setRequired(true)
      );
  }

  override async execute(_bot: Bot, interaction: Interaction) {
    const message = interaction.options.getString("message", true);

    const commandChannel = interaction.channel;
    if (commandChannel instanceof TextChannel) {
      if (interaction.user.id === "321639963848343563") {
        commandChannel.send(message);
        interaction.reply({ content: "Message envoyé", flags: MessageFlags.Ephemeral });
      } else {
        interaction.reply(":see_no_evil:");
      }
    }
  }
}
