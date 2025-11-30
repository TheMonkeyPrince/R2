import { CronJob } from 'cron';

import type Bot from "../../bot.js";
import { prisma } from "../../db.js";
import { Module } from "../module.js";
import { jobMap } from './job-list.js';
import { JobExecutionType, type JobTag } from '../../../generated/prisma/enums.js';
import logger from '../../logger.js';

interface Job {
    id: number;
    executionType: JobExecutionType;
    runAt: Date | null;
    cronExpr: string | null;
    tag: JobTag;
    payload: string;
}

export class JobScheduler extends Module {
	public static instance: JobScheduler;

	constructor(bot: Bot) {
		super(bot, "JobScheduler");
		JobScheduler.instance = this;
	}

	async start() {
		const jobs = await prisma.scheduledJob.findMany();
		for (const job of jobs) {
			this.scheduleJob(job);
		}
	}

	public async scheduleJob(job: Job) {
		switch (job.executionType) {
			case JobExecutionType.ONCE:
				if (!job.runAt || job.runAt.getTime() < Date.now()) {
					prisma.scheduledJob.delete({ where: { id: job.id } });
				} else {
					this.scheduleJobOnce(job.id, job.runAt);
				}
				break;

			case JobExecutionType.CRON:
				if (!job.cronExpr) {
					prisma.scheduledJob.delete({ where: { id: job.id } });
				} else {
					this.scheduleJobWithCron(job.id, job.cronExpr);
				}
				break;

			default:
				logger.error(`Unknown job execution type for job ${job.id}: ${job.executionType}`);
				break;
		}
	}

	async scheduleJobOnce(id: number, runAt: Date) {
		logger.debug(`Scheduling one-time job ${id} at ${runAt.toISOString()}`);
		new CronJob(
			new Date(runAt),
			async () => {
				logger.debug(`Executing one-time job ${id}`);
				const job = await prisma.scheduledJob.findUnique({ where: { id: id } });
				if (!job || job.runAt !== runAt) {
					logger.debug(`One-time job ${id} no longer valid, skipping execution`);
					return;
				};

				await this.executeJob(job.tag, job.payload);
				prisma.scheduledJob.delete({ where: { id: id } });
			},
			null,
			true
		);
	}

	private async scheduleJobWithCron(id: number, cronExpr: string) {
		logger.debug(`Scheduling cron job ${id} with expression ${cronExpr}`);
		const cronJob = new CronJob(
			cronExpr,
			async () => {
				logger.debug(`Executing cron job ${id}`);
				const job = await prisma.scheduledJob.findUnique({ where: { id: id } });
				if (!job || job.cronExpr !== cronExpr) {
					logger.debug(`Cron job ${id} no longer valid, stopping cron job`);
					cronJob.stop();
					return;
				}

				await this.executeJob(job.tag, job.payload)
			},
			null,
			true
		);
	}

	private async executeJob(tag: JobTag, payload: string) {
		logger.debug(`Executing job with tag ${tag}`);
		const executor = jobMap[tag];
		await executor(this.bot, payload);
	}
}
