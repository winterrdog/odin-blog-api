import pino, { LoggerOptions } from "pino";
const defaultLoggingOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? "info",
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
function getModuleName(fname: string): string {
  return fname.split("/").at(-1)!.split(".")[0] + ": ";
}
export function startLogger(fname: string) {
  return pino({
    ...defaultLoggingOptions,
    msgPrefix: "blog-api:" + getModuleName(fname),
  });
}
