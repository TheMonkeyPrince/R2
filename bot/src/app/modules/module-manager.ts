import type Bot from "../bot.js";
import logger from "../logger.js";
import { JobScheduler } from "./job-scheduler/job-scheduler.js";
import type { Module } from "./module.js";
import { Soundboard } from "./soundboard/soundboard.js";

import config from "../config.js"

type ModuleConstructor<T extends Module = Module> = new (...args: any[]) => T;

export function loadModules(bot: Bot) {
  const moduleList: ModuleConstructor[] = [
    Soundboard,
    JobScheduler,
  ];

  for (const module of moduleList.filter(m => {
    const moduleName = m.name;
    return config.modules[moduleName];
  })) {
    logger.info(`Starting module: ${module["name"]}`);
    new module(bot).start();
  }
}
