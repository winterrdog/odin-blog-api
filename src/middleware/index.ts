import { NextFunction, Response, Request, Express } from "express";
import passport from "passport";
import userPassStrategy from "./user-pass-auth";
import jwtStrategy from "./jwt-auth";
import { isAuthor, isReader } from "./role-based-auth";

const redirectPath = "/api/users/sign-in";

function authenticateUserPass(req: Request, res: Response, next: NextFunction) {
  return passport.authenticate("local", {
    failureRedirect: redirectPath,
    session: false,
  })(req, res, next);
}

function authenticateJwt(req: Request, res: Response, next: NextFunction) {
  return passport.authenticate("jwt", {
    failureRedirect: redirectPath,
    session: false,
  })(req, res, next);
}

function initialize(app: Express) {
  app.use(passport.initialize());

  // register strategies
  passport.use(userPassStrategy);
  passport.use(jwtStrategy);
}

const auth = {
  initialize,
  authenticateUserPass,
  authenticateJwt,
  isAuthor,
  isReader,
};

export default auth;
