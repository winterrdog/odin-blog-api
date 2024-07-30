import { Express } from "express";
import * as express from "express";
import { URL } from "url";
import * as cors from "cors";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { startLogger } from "../logging";
import { initialize as initPassport } from "./passport-auth";
require("dotenv").config();

const logger = startLogger(__filename);
const customHeaders = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  res.setHeader("X-Powered-By", "some-shxt");
  return next();
};
export default function applyGeneralMiddleware(app: Express) {
  logger.info("starting app middleware...");
  app.use(customHeaders);
  app.use(express.json()); // parse application/json
  app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded

  if (process.env.NODE_ENV === "production") {
    const validateCORSOrigin = (
      origin: string | undefined,
      callback: (
        err: Error | null,
        origin?: string | boolean | RegExp | (string | boolean | RegExp)[]
      ) => void
    ): void => {
      // allow mobile apps to access the API
      if (!origin) {
        return callback(null, true);
      }

      const originHost = new URL(origin).hostname;
      const allowedHosts = new Set([
        "muchubatactics.github.io",
        "localhost",
        "127.0.0.1",
      ]);

      const isHostAllowed = allowedHosts.has(originHost);
      if (!isHostAllowed) {
        return callback(new Error("not allowed by CORS"));
      }

      return callback(null, true);
    };

    // allow cross-origin requests
    app.use(cors({ origin: validateCORSOrigin, credentials: true }));
    app.disable("etag");
    app.use(helmet()); // set security headers
    app.use(
      rateLimit({
        windowMs: 20 * 60 * 1000, // 20 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message:
          "Too many requests from this IP, please try again after 20 minutes. Like for real, chill out a bit.",
        statusCode: 429,
      })
    ); // limit repeated requests to avoid abuse of the API
  }

  initPassport(app); // set up passport
}
