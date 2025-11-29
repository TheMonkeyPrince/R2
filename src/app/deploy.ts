import { REST, Routes } from "discord.js";

import { TOKEN, CLIENT_ID, DEV_GUILD_ID } from "./env.js";
import commandList from "./commands/command-list.js";
import logger from "./logger.js";

const commands = commandList.map((command) => command.data.toJSON());

if (process.argv[2] === "global") {
  logger.info(`Deploying ${commands.length} commands globally.`);
} else {
  logger.info(`Deploying ${commands.length} commands to ${DEV_GUILD_ID}.`);
}

const rest = new REST().setToken(TOKEN);
(async () => {
  try {
    logger.info(
      `Started refreshing ${commands.length} application (/) commands.`
    );

	let data: any;
    if (process.argv[2] === "global") {
      data = await rest.put(Routes.applicationCommands(CLIENT_ID), {
        body: commands,
      });
    } else {
      data = await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, DEV_GUILD_ID),
        { body: commands }
      );
    }

    logger.info(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    logger.error(error);
  }
})();
