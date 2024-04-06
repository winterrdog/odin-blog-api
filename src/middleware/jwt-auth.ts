import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "./interfaces";
import { UserModel } from "../models/user";

require("dotenv").config();

async function verifyJwtCb(payload: JwtPayload, cb: any) {
  try {
    const user = await UserModel.findById(payload.data.sub);
    if (!user) return cb(null, false);

    (user as any)["data"] = {
      ...payload.data,
    };
    return cb(null, user);
  } catch (e) {
    console.error(`error occurred during jwt verification: ${e}`);
    return cb(e);
  }
}

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: process.env.JWT_SECRET!,
};

const jwtStrategy = new Strategy(options, verifyJwtCb);
export default jwtStrategy;
