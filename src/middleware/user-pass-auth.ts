import { log } from "console";
import * as argon from "argon2";
import { Strategy as LocalStrategy } from "passport-local";
import { UserModel } from "../models/user";

const options = {
  usernameField: "name",
  passwordField: "pass",
  session: false,
};

const isPasswordValid = async function (
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    return await argon.verify(storedHash, password);
  } catch (err) {
    log(`error occured during password verification: ${err}`);
    return false;
  }
};

const verifyUserCb = async function (
  username: string,
  password: string,
  cb: any
): Promise<void> {
  try {
    const user = await UserModel.findOne({ name: username });
    if (!user) {
      return cb(null, false, {
        message: `user with name, ${username}, was not found`,
      });
    }
    if (!(await isPasswordValid(password, user.passwordHash))) {
      return cb(null, false, {
        message: `password, ${password}, is incorrect`,
      });
    }

    return cb(null, user);
  } catch (err) {
    log(`error occured during user verification: ${err}`);
    return cb(err);
  }
};

const userPassStrategy = new LocalStrategy(options, verifyUserCb);
export default userPassStrategy;
