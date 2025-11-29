import type Bot from "../bot.js";
import logger from "../logger.js";
import type { Module } from "./module.js";
import { Soundboard } from "./soundboard/soundboard.js";

type ModuleConstructor<T extends Module = Module> = new (...args: any[]) => T;

export function loadModules(bot: Bot) {
  const moduleList: ModuleConstructor[] = [
    Soundboard
  ];

  for (const module of moduleList) {
    logger.info(`Starting module: ${module["name"]}`);
    new module(bot).start();
  }
}
