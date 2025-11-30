import { JobTag } from "../../../generated/prisma/enums.js";
import type Bot from "../../bot.js";
import { runMotivationalJob } from "./jobs/daily-motivation.js";

export type JobExecutor = (bot: Bot, payload: string) => Promise<void>;

export const jobMap: Record<JobTag, JobExecutor> = {
	[JobTag.DAILY_MOTIVATIONAL_QUOTE]: runMotivationalJob,
	[JobTag.SEND_BADMINTON_REMINDER]: async (_bot: Bot, _payload: string) => {},
	[JobTag.SEND_CHANNEL_MESSAGE]: async (_bot: Bot, _payload: string) => {},
};