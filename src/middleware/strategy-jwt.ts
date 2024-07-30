import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "./interfaces";
import { UserModel } from "../models/user";
import { startLogger } from "../logging";
require("dotenv").config();

const logger = startLogger(__filename);
const verifyJwtCb = async (payload: JwtPayload, cb: any) => {
  try {
    logger.info(`verifying jwt for user: ${payload.data.sub}`);
    const user = await UserModel.findById(payload.data.sub);

    if (!user) {
      logger.error(`user not found for jwt: ${payload.data.sub}`);
      return cb(null, false);
    }

    logger.info(`user found for jwt: ${payload.data.sub}`);
    (user as any)["data"] = payload;
    return cb(null, user);
  } catch (e) {
    logger.error(e, "error occurred during jwt verification");
    return cb(e);
  }
};
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: process.env.JWT_SECRET!,
};
logger.info("setting up jwt strategy...");
const jwtStrategy = new Strategy(options, verifyJwtCb);

export default jwtStrategy;
