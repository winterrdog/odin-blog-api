import * as argon from "argon2";
import { Strategy as LocalStrategy } from "passport-local";
import { UserModel } from "../models/user";
import { startLogger } from "../logging";

const logger = startLogger(__filename);
const options = {
  usernameField: "name",
  passwordField: "pass",
  session: false,
};
const isPasswordValid = async function (
  password: string,
  storedHash: string,
): Promise<boolean> {
  try {
    return await argon.verify(storedHash, password);
  } catch (err) {
    logger.error(err, "error occured during password verification");
    return false;
  }
};
const verifyUserCb = async function (
  username: string,
  password: string,
  cb: any,
): Promise<void> {
  try {
    logger.info(`verifying user: ${username}...`);
    const user = await UserModel.findOne({ name: username });

    if (!user) {
      logger.error(
        `user with name, ${username}, was not found thus cannot login`,
      );
      return cb(null, false, {
        message: `user with name, ${username}, was not found`,
      });
    }

    const isPasswordCorrect = await isPasswordValid(
      password,
      user.passwordHash,
    );
    if (!isPasswordCorrect) {
      logger.error(
        `password is incorrect for user: ${username} hence cannot login`,
      );
      return cb(null, false, {
        message: `password, ${password}, is incorrect`,
      });
    }

    logger.info(`user: ${username} verified successfully!`);
    return cb(null, user);
  } catch (err) {
    logger.error(err, `error occured during verification of user: ${username}`);
    return cb(err);
  }
};
logger.info("setting up user-password passport strategy...");
const userPassStrategy = new LocalStrategy(options, verifyUserCb);

export default userPassStrategy;
