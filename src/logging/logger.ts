import pino, { LoggerOptions } from "pino";
require("dotenv").config(); // env vars

// transport logs to external file and console
let logFile: string;
if (process.env.NODE_ENV === "production") {
  logFile = process.env.LOGS_FILE!;
} else {
  logFile = process.env.DEV_LOGS_FILE!;
}

createLogFile(logFile);

const logTransports = pino.transport({
  targets: [
    {
      target: "pino-pretty",
      options: {
        levelFirst: true,
        colorize: true,
        translateTime: "dd/mm/yyyy HH:MM:ss.L TT Z",
      },
    },
    {
      target: "pino/file",
      level: "trace",
      options: {
        destination: logFile,
      },
    },
  ],
});

const defaultLoggingOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? "info",
  timestamp: pino.stdTimeFunctions.isoTime,
};

function getModuleName(fname: string): string {
  return fname.split("/").at(-1)!.split(".")[0] + ": ";
}

export function startLogger(fname: string) {
  return pino(
    {
      ...defaultLoggingOptions,
      msgPrefix: "blog-api:" + getModuleName(fname),
    },
    logTransports,
  );
}

async function createLogFile(f: string) {
  try {
    // import 'Utility' into a variable to avoid circular dependency
    const Utility = (await import("../utilities")).default;
    await Utility.createFile(f);
  } catch (err) {
    console.error("failed to create an external log file: ", err);
    process.exit(1);
  }
}
