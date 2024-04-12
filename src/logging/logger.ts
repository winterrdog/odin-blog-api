import pino, { LoggerOptions } from "pino";
export const defaultLoggingOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? "info",
  msgPrefix: "blog-api:",
  transport: {
    target: "pino-pretty",
    // pino-pretty options
    options: {
      levelFirst: true,
      colorize: true,
      translateTime: "dd/mm/yyyy HH:MM:ss.L TT Z",
    },
  },
};
export const defaultLogger = pino(defaultLoggingOptions);
export function getModuleName(fname: string): string {
  return fname.split("/").at(-1)!.split(".")[0] + ": ";
}
