
import { TOKEN } from "./env.js";
import Bot from "./bot.js";
import { loadModules } from "./modules/module-manager.js";

const bot = new Bot() 
loadModules(bot)

bot.login(TOKEN)