import { NextFunction, Response, Request, Express } from "express";
import * as passport from "passport";
import userPassStrategy from "./strategy-user-pass";
import jwtStrategy from "./strategy-jwt";

const redirectPath = "/api/users/sign-in";
export function authenticateUserPass(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return passport.authenticate("local", {
    failureRedirect: redirectPath,
    session: false,
  })(req, res, next);
}
export function authenticateJwt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return passport.authenticate("jwt", {
    failureRedirect: redirectPath,
    session: false,
  })(req, res, next);
}
export function initialize(app: Express) {
  app.use(passport.initialize());

  // register strategies
  passport.use(userPassStrategy);
  passport.use(jwtStrategy);
}
