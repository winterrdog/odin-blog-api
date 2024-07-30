import { NextFunction, Response, Request, Express } from "express";
import * as passport from "passport";
import userPassStrategy from "./strategy-user-pass";
import jwtStrategy from "./strategy-jwt";
import { startLogger } from "../logging";

const logger = startLogger(__filename);
export function authenticateUserPass(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // note: if u used "failureRedirect", that route better be
  // a GET route otherwise, opt for maximum control thru a callback
  const cb: passport.AuthenticateCallback = (
    err: any,
    user?: Express.User | false | null,
    info?: object | string | Array<string | undefined>,
    status?: number | Array<number | undefined>,
  ): any => {
    if (err) {
      info &&
        logger.error(`error happened in user-pass auth: ${info.toString()}`);
      return next(err);
    }

    if (!user) {
      info &&
        logger.warn(
          `something not nice happened in user-pass auth: ${info.toString()}`,
        );
      const message = "invalid or corrupted or NO user logins were provided";
      if (typeof status === "number") {
        return res.status(status).json({ message });
      }
      return res.status(401).json({ message });
    }

    req.user = user;
    return next();
  };

  return passport.authenticate("local", { session: false }, cb)(req, res, next);
}

export function authenticateJwt(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // note: if u used "failureRedirect", that route better be
  // a GET route otherwise, opt for maximum control thru a callback
  const cb: passport.AuthenticateCallback = (
    err: any,
    user?: Express.User | false | null,
    info?: object | string | Array<string | undefined>,
    status?: number | Array<number | undefined>,
  ): any => {
    if (err) {
      info && logger.error(`error happened in JWT auth: ${info.toString()}`);
      return next(err);
    }

    if (!user) {
      info &&
        logger.warn(
          `something not nice happened in JWT auth: ${info.toString()}`,
        );
      const message = "invalid or corrupted or NO jwt was provided";
      if (typeof status === "number") {
        return res.status(status).json({ message });
      }
      return res.status(401).json({ message });
    }

    req.user = user;
    return next();
  };

  return passport.authenticate("jwt", { session: false }, cb)(req, res, next);
}

export function initialize(app: Express) {
  app.use(passport.initialize());

  // register strategies
  passport.use(userPassStrategy);
  passport.use(jwtStrategy);
}
