import { createLogger, format, transports } from "winston"
import { APP_NAME, NODE_ENV } from "./env.js";

const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
	return `${timestamp} ${level}: ${message}`;
});

const defaultFormat = format.combine(
	format.timestamp({
		format: 'YYYY-MM-DD HH:mm:ss'
	}),
	format.errors({ stack: true }),
	myFormat
)

export const logger = createLogger({
	level: NODE_ENV === "development" ? "debug" : "info",
	// format: format.combine(
	// 	format.timestamp({
	// 		format: 'YYYY-MM-DD HH:mm:ss'
	// 	}),
	// 	format.errors({ stack: true }),
	// 	// format.splat(),
	// 	// format.json()
	// ),
	format: defaultFormat,
	defaultMeta: { service: APP_NAME },
	transports: [
		//
		// - Write to all logs with level `info` and below to `quick-start-combined.log`.
		// - Write all logs error (and below) to `quick-start-error.log`.
		//
		new transports.File({ filename: 'logs/errors.log', level: 'error' }),
		new transports.File({ filename: 'logs/out.log' })
	]
});

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
// if (NODE_ENV === "development") {
logger.add(new transports.Console({
	format: format.combine(
		format.colorize(),
		defaultFormat
	)
}));
// }

logger.info("Logger ready !")

export default logger