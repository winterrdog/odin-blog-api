import { Express } from "express";
import * as express from "express";
import { URL } from "url";
import * as cors from "cors";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { startLogger } from "../logging";
import { initialize as initPassport } from "./passport-auth";

const cookieParser = require("cookie-parser");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);

require("dotenv").config();

const logger = startLogger(__filename);

export default applyGeneralMiddleware;

// ****************************************************
//            FUNCTION IMPLEMENTATIONS
// ****************************************************
function applyGeneralMiddleware(app: Express) {
  logger.info("starting app middleware...");

  // used to trust the first proxy in front of the server
  // since the app is behind a reverse proxy i.e. nginx or railway
  app.set("trust proxy", 1 /* number of proxies between user and server */);

  app.use(customHeaders);
  app.use(express.json()); // parse application/json
  app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
  initializeSession(app);

  if (process.env.NODE_ENV === "production") {
    const validateCORSOrigin = function validateCORSOrigin(
      origin: string | undefined,
      callback: (
        err: Error | null,
        origin?: string | boolean | RegExp | (string | boolean | RegExp)[]
      ) => void
    ): void {
      // allow mobile apps to access the API
      if (!origin) {
        return callback(null, true);
      }

      const originHost = new URL(origin).hostname;
      const allowedHosts = [
        "muchubatactics.github.io",
        "winterrdog.github.io",
        "localhost",
        "127.0.0.1",
      ];

      const isHostAllowed = allowedHosts.includes(originHost);
      if (!isHostAllowed) {
        return callback(new Error("not allowed by CORS"));
      }

      return callback(null, true);
    };

    // allow cross-origin requests
    app.use(
      cors({
        origin: validateCORSOrigin,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        optionsSuccessStatus: 204,
      })
    );
    app.disable("etag");
    app.use(cookieParser());
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

function customHeaders(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  res.setHeader("X-Powered-By", "some-shxt");
  return next();
}

function initializeSession(app: Express) {
  const twoDays = 3_600_000 * 24 * 2;

  app.use(
    session({
      store: new MemoryStore({
        checkPeriod: 2 * 24 * 3_600_000, // prune expired entries every 2 days
        ttl: twoDays,
      }),
      secret: process.env.JWT_SECRET!,
      name: "session_id",
      resave: false,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: twoDays,
      },
    })
  );
}

// import Tokens from "csrf";
// interface XsrfToken {
//   token: string;
//   secret: string;
// }

// async function generateCsrfToken(): Promise<XsrfToken> {
//   const tokens = new Tokens();

//   const secret = await tokens.secret();
//   const token = tokens.create(secret);

//   return { token, secret };
// }
