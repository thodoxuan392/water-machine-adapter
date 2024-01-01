import winston = require("winston");

export class Logger {
	static getLogger(): winston.Logger {
		return winston.createLogger({
			level: "info",
			format: winston.format.combine(
				winston.format.json(),
				winston.format.colorize()
			),
			defaultMeta: { service: "Water-Machine" },
			transports: [
				new winston.transports.Console(),
				new winston.transports.File({
					filename: "log/info.log",
					level: "error",
				}),
				new winston.transports.File({
					filename: "log/error.log",
					level: "error",
				}),
			],
		});
	}
}
