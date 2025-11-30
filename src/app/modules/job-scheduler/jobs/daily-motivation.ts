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

export interface MotivationalJobPayload {
	subscribedChannels: SubscribedChannel[];
}

export async function runMotivationalJob(bot: Bot, rawJobPayload: string) {
	logger.debug("Running daily motivational quote job");
	const payload = JSON.parse(rawJobPayload) as MotivationalJobPayload;

	logger.debug(`Motivational job payload: ${JSON.stringify(payload)}`);
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


		channel.send({ embeds: [embed] }).catch((error) => {
			logger.error(`Failed to send motivational quote to ${channelInfo.channelId} in guild ${channelInfo.guildId}: ${error}`);
		});
	}
}

export async function createMotivationalJob(subscribedChannels: SubscribedChannel[]) {
	const payload: MotivationalJobPayload = {
		subscribedChannels
	};	
	const job = await prisma.scheduledJob.create({
		data: {
			executionType: JobExecutionType.CRON,
			cronExpr: '0 7 * * *', // Every day at 7 AM
			tag: JobTag.DAILY_MOTIVATIONAL_QUOTE,
			payload: JSON.stringify(payload),
		}
	});
	
	JobScheduler.instance.scheduleJob(job);
	return job;
}