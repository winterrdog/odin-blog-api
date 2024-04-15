import { Request, Response } from "express";
import _ from "lodash";
import * as argon2 from "argon2";
import { JwtPayload } from "../middleware/interfaces";
import { UserModel } from "../models/user";
import Utility from "../utilities";
import {
  passwordValidator,
  unameValidator,
  userReqBodyValidators,
  userUpdateReqBodyValidators,
} from "../validators/user";
import { UserUpdateReqBody } from "../request-bodies/user";
import { startLogger } from "../logging";

const logger = startLogger(__filename);
const userController = {
  signUp: [
    ...userReqBodyValidators,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        // collect details
        const { name, pass: password, role } = req.body;
        logger.info(`signing up user with name: ${name}, role: ${role}...`);

        // check if user with name already exists
        {
          logger.info("checking if user with name already exists...");
          const user = await UserModel.findOne({ name });
          if (user) {
            logger.error(`user with name: ${name} already exists`);
            return res.status(409).json({
              message:
                "User with name already exists. Try using a different name.",
            });
          }
        }

        // store details in db
        const passwordHash = await argon2.hash(password as string);
        const createdUser = await UserModel.create({
          name,
          passwordHash,
          role,
        });

        // craft jwt and send it back
        const jwtPayload: JwtPayload = {
          data: {
            sub: createdUser.id,
            role,
          },
        };

        const token = await Utility.generateJwtPayload(jwtPayload);
        logger.info(
          `user with name: ${name} signed up successfully with role: ${role} -- token: ${token}`
        );
        return res.status(201).json({
          message: "User created successfully",
          token,
        });
      } catch (e) {
        logger.error(e, "error during signing up");
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
  signIn: [
    unameValidator,
    passwordValidator,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        const { name, pass: password } = req.body;
        logger.info(`signing in user with name: ${name}...`);

        const user = await UserModel.findOne({ name });
        if (!user) {
          logger.error(`user with name: ${name} not found`);
          return res.status(404).json({
            message: `user with username: ${name} was not found.`,
          });
        }

        logger.info(`user with name: ${name} found. verifying password...`);
        const isPasswordValid = await argon2.verify(
          user.passwordHash,
          password
        );
        if (!isPasswordValid) {
          logger.error(`invalid password for user with name: ${name}`);
          return res.status(401).json({ message: "Invalid password" });
        }

        // craft jwt and send it back
        const jwtPayload: JwtPayload = {
          data: {
            sub: user.id,
            role: user.role,
          },
        };
        const token = await Utility.generateJwtPayload(jwtPayload);
        logger.info(
          `user with name: ${name} and role: ${user.role} signed in successfully -- token: ${token}`
        );
        return res.status(200).json({
          message: "User signed in successfully",
          token,
        });
      } catch (e) {
        logger.error(e, "error occurred during signing in");
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
  deleteUser: async function (req: Request, res: Response) {
    try {
      // grab their user id from jwt
      const { data } = (req.user! as any).data as JwtPayload;
      const { sub } = data;
      logger.info(`deleting user with id: ${sub}...`);

      // check if user with id exists
      const user = await UserModel.findById(sub);
      if (!user) {
        logger.error(`user with id: ${sub} not found hence cannot be deleted`);
        return res.status(404).json({
          message: "User not found",
        });
      }

      await user.deleteOne();
      logger.info(`user with id: ${sub} deleted successfully`);
      return res.status(204).json({
        message: "User deleted successfully",
      });
    } catch (e) {
      logger.error(e, "error occurred during deletion of user");
      return res.status(500).json({
        message:
          process.env.NODE_ENV === "production"
            ? "Internal server error occurred. Please try again later."
            : (e as Error).message,
      });
    }
  },
  updateUser: [
    ...userUpdateReqBodyValidators,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        // grab their user id from jwt
        const { data } = (req.user! as any).data as JwtPayload;
        const { sub } = data;
        logger.info(`updating user with id: ${sub}...`);

        // check if user with id exists
        let user = await UserModel.findById(sub);
        if (!user) {
          logger.error(
            `user with id: ${sub} not found hence cannot be updated`
          );
          return res.status(404).json({ message: "User not found" });
        }

        // merge data to update
        user = _.merge(user, req.body as UserUpdateReqBody);
        await user!.save();
        logger.info(`user with id: ${sub} updated successfully!`);
        return res.status(200).json({
          message: "User updated",
          user,
        });
      } catch (e) {
        logger.error(e, "error occurred during updating a user's details");
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
};
export default userController;
