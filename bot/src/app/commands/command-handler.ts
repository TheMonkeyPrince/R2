import { Events, MessageFlags } from "discord.js";

import Bot from "../bot.js";
import type { Command } from "./command.js";
import commandList from "./command-list.js";
import logger from "../logger.js";

export default class CommandHandler {
  public readonly registeredCommands: Map<string, Command>;

  constructor(bot: Bot) {
    this.registeredCommands = new Map<string, Command>();

    commandList.forEach((command) => {
      const commandName = command.data.name;
      this.registeredCommands.set(commandName, command);
    });

    bot.client.on(Events.InteractionCreate, async (interaction) => {
      logger.debug(
        `Interaction received: ${interaction.user.tag} invoked ${
          interaction.isChatInputCommand()
            ? interaction.commandName
            : "a non-command interaction"
        }`
      );

      if (!interaction.isChatInputCommand()) return;
      if (interaction.replied) return;

      const command = this.registeredCommands.get(interaction.commandName);
      if (command === undefined) {
        logger.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(bot, interaction);
      } catch (error) {
        logger.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "There was an error while executing this command!",
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await interaction.reply({
            content: "There was an error while executing this command!",
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    });
  }
}
