import { MessageFlags, SlashCommandBuilder } from "discord.js";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";
import { buildQuoteEmbed, getRandomQuote } from "../../../lib/quote-api.js";
import logger from "../../logger.js";

export default class MotivateMe extends Command {
  override get data() {
    return new SlashCommandBuilder()
      .setName("motivateme")
      .setDescription("Gimme motivation plz")
      .addMentionableOption((option) =>
        option.setName("target").setDescription("The target")
      );
  }

  override async execute(_bot: Bot, interaction: Interaction) {
    const target = interaction.options.getMentionable("target")?.toString();

    const quote = await getRandomQuote().catch((error) => {
      logger.error(error);
      interaction.reply({
        content: "No quote found",
        flags: MessageFlags.Ephemeral,
      });
    });

    if (!quote) return;
    const embed = buildQuoteEmbed(quote);
    if (target) {
      interaction.reply({ content: target, embeds: [embed] });
    } else {
	  interaction.reply({ embeds: [embed] });
	}
  }
}
