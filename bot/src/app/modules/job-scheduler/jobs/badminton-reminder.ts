import { JobExecutionType, JobTag } from "../../../../generated/prisma/enums.js";
import { buildQuoteEmbed, getRandomQuote } from "../../../../lib/quote-api.js";
import type Bot from "../../../bot.js";
import { prisma } from "../../../db.js";
import logger from "../../../logger.js";
import { JobScheduler } from "../job-scheduler.js";

export interface SubscribedChannel {
	guildId: string;
	channelId: string;
}

export interface BadmintonReminderJobPayload {
	subscribedChannels: SubscribedChannel[];
}

export async function runBadmintonReminderJob(bot: Bot, rawJobPayload: string) {
	logger.debug("Running badminton reminder job");
	const payload = JSON.parse(rawJobPayload) as BadmintonReminderJobPayload;

	logger.debug(`Badminton reminder job payload: ${JSON.stringify(payload)}`);
	const quote = await getRandomQuote().catch((error) => {
		logger.error(error);
	});
	if (!quote) return;
	const embed = buildQuoteEmbed(quote);

	for (const channelInfo of payload.subscribedChannels) {
		const guild = bot.client.guilds.cache.get(channelInfo.guildId);
		if (!guild) continue;

		const channel = guild.channels.cache.get(channelInfo.channelId);
		if (!channel || !channel.isTextBased()) continue;


		channel.send({ content: ":badminton: :hot_face: Inscriptions au badminton par ici les loulous <@&1217476690457002115> ! https://sport.unil.ch/?pid=80&aid=61#content :muscle:", embeds: [embed] }).catch((error) => {
			logger.error(`Failed to send badminton reminder to ${channelInfo.channelId} in guild ${channelInfo.guildId}: ${error}`);
		});
	}
}

export async function createBadmintonReminderJob(subscribedChannels: SubscribedChannel[]) {
	const payload: BadmintonReminderJobPayload = {
		subscribedChannels
	};	
	const job = await prisma.scheduledJob.create({
		data: {
			executionType: JobExecutionType.CRON,
			cronExpr: '0 17 * * 1,2,4', // Every Monday, Tuesday, and Wednesday at 5 PM
			tag: JobTag.SEND_BADMINTON_REMINDER,
			payload: JSON.stringify(payload),
		}
	});
	
	JobScheduler.instance.scheduleJob(job);
	return job;
}