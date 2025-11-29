import { CronJob } from 'cron';

import type Bot from "../../bot.js";
import { prisma } from "../../db.js";
import { Module } from "../module.js";

enum JobType {
	ONCE = 'ONCE',
	CRON = 'CRON'
}

interface JobData {
	type: JobDataType;
	payload: any;
}

enum JobDataType {

}

function scheduledJobOnce(id: number, runAt: Date, jobData: JobData) {
	new CronJob(
		new Date(runAt),
		async () => {
			await executeJob(id, jobData);
			prisma.scheduledJob.delete({ where: { id: id } });
		},
		null,
		true
	);
}

function scheduledJobCron(id: number, cronExpr: string, jobData: JobData) {
	new CronJob(
		cronExpr,
		async () => await executeJob(id, jobData),
		null,
		true
	);
}

async function executeJob(id: number, jobData: JobData) {

}

async function loadJobs() {
	const jobs = await prisma.scheduledJob.findMany();

	for (const job of jobs) {
		switch (job.type) {
			case JobType.ONCE:
				if (!job.runAt || job.runAt.getTime() < Date.now()) {
					prisma.scheduledJob.delete({ where: { id: job.id } });
				} else {
					scheduledJobOnce(job.id, job.runAt, JSON.parse(job.payload?.toString()!) as JobData);
				}
				break;

			case JobType.CRON:
				if (!job.cronExpr) {
					prisma.scheduledJob.delete({ where: { id: job.id } });
				} else {
					scheduledJobCron(job.id, job.cronExpr, JSON.parse(job.payload?.toString()!) as JobData);
				}
				break;
		}
	}
}


export class JobScheduler extends Module {
	constructor(bot: Bot) {
		super(bot, "JobScheduler");
	}

	start(): void {

	}

}
