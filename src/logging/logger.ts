import pino, { LoggerOptions } from "pino";
const options: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    level(label, number) {
      return { level: `🎬 ${label.toUpperCase()}` };
    },
  },
  transport: {
    target: "pino-pretty",
    // pino-pretty options
    options: {
      levelFirst: true,
      colorize: true,
      timestampKey: "loggedAt",
      translateTime: "fullDate longTime",
    },
  },
};
const logger = pino(options);
export default logger;
