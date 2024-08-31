import { Request, Response } from "express";
import * as _ from "lodash";
import * as argon2 from "argon2";
import { JwtPayload } from "../middleware/interfaces";
import { UserDocument, UserModel } from "../models/user";
import Utility, { TransactionCallback } from "../utilities";
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
  signUp: signUpHandler(),
  signIn: signInHandler(),
  deleteUser: deleteUserHandler(),
  updateUser: updateUserHandler(),
  logout: logoutHandler(),
};

function logoutHandler() {
  const handler = async function (req: Request, res: Response): Promise<any> {
    try {
      const currUserId = Utility.extractUserIdFromToken(req);
      logger.info(`logging out user with id: ${currUserId}...`);

      const cb: TransactionCallback<UserDocument | null> = async (session) => {
        return await UserModel.findById(currUserId, null, { session });
      };

      const user = await Utility.runOperationInTransaction(cb);
      if (!user) {
        logger.error(
          `user with id: ${currUserId} not found hence cannot be logged out`
        );
        return res.status(404).json({ message: "user not found" });
      }

      // increment token version
      const updateCb: TransactionCallback<void> = async (session) => {
        // does the user have a token version yet?
        if (!user.tokenVersion) {
          user.tokenVersion = 0;
        }

        user.tokenVersion++;
        await user.save({ session });
      };

      await Utility.runOperationInTransaction(updateCb);
      logger.info(`user with id: ${currUserId} logged out successfully!`);

      return res.status(204).end();
    } catch (e) {
      logger.error(e, "error occurred during logging out");
      Utility.handle500Status(res, <Error>e);
    }
  };

  return handler;
}

function signUpHandler() {
  const signupUser = async function (
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      // collect details
      const { name, pass: password, role } = req.body;
      logger.info(`signing up user with name: ${name}, role: ${role}...`);

      // check if user with name already exists
      {
        logger.info("checking if user with name already exists...");

        const cb: TransactionCallback<UserDocument | null> = async (
          session
        ) => {
          return await UserModel.findOne({ name }, null, { session });
        };

        const user = await Utility.runOperationInTransaction(cb);
        if (user) {
          logger.error(`user with name: ${name} already exists`);
          return res.status(409).json({
            message:
              "User with name already exists. Try using a different name.",
          });
        }
      }

      // store details in db
      const passwordHash = await argon2.hash(<string>password);
      const cb: TransactionCallback<UserDocument> = async (session) => {
        const newUserData = [{ name, passwordHash, role }];
        const user = await UserModel.create(newUserData, { session });

        return user[0] as unknown as UserDocument;
      };
      const createdUser = await Utility.runOperationInTransaction(cb);

      // craft jwt and send it back
      const jwtPayload = createJwtPayload(createdUser);

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
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [
    ...userReqBodyValidators,
    Utility.validateRequest,
    signupUser,
  ];

  return handlers;
}

function signInHandler() {
  const signInUser = async function (
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const { name, pass: password } = req.body;

      logger.info(`signing in user with name: ${name}...`);

      const cb: TransactionCallback<UserDocument | null> = async (session) => {
        return await UserModel.findOne({ name }, null, { session });
      };
      const user = await Utility.runOperationInTransaction(cb);
      if (!user) {
        logger.error(`user with name: ${name} not found`);
        return res.status(404).json({
          message: `user with username: ${name} was not found.`,
        });
      }

      logger.info(`user with name: ${name} found. verifying password...`);

      const isPasswordValid = await argon2.verify(user.passwordHash, password);
      if (!isPasswordValid) {
        logger.error(`invalid password for user with name: ${name}`);
        return res.status(401).json({ message: "Invalid password" });
      }

      // craft jwt and send it back
      const jwtPayload = createJwtPayload(user);
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
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [
    unameValidator,
    passwordValidator,
    Utility.validateRequest,
    signInUser,
  ];

  return handlers;
}

function deleteUserHandler() {
  const handler = async function (req: Request, res: Response): Promise<any> {
    try {
      const currUserId = Utility.extractUserIdFromToken(req);
      logger.info(`deleting user with id: ${currUserId}...`);

      // check if user with id exists
      const cb: TransactionCallback<UserDocument | null> = async (session) => {
        return await UserModel.findById(currUserId, null, { session });
      };

      const user = await Utility.runOperationInTransaction(cb);
      if (!user) {
        logger.error(
          `user with id: ${currUserId} not found hence cannot be deleted`
        );
        return res.status(404).json({ message: "User not found" });
      }

      const deleteCb: TransactionCallback<void> = async (session) => {
        await user.deleteOne({ session });
      };

      await Utility.runOperationInTransaction(deleteCb);
      logger.info(`user with id: ${currUserId} deleted successfully`);

      return res.status(204).end();
    } catch (e) {
      logger.error(e, "error occurred during deletion of user");
      Utility.handle500Status(res, <Error>e);
    }
  };

  return handler;
}

function updateUserHandler() {
  const editUserDetails = async function (
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const currUserId = Utility.extractUserIdFromToken(req);
      logger.info(`updating user with id: ${currUserId}...`);

      // check if user with id exists
      const cb: TransactionCallback<UserDocument | null> = async (session) => {
        return await UserModel.findById(currUserId, null, { session });
      };

      let user = await Utility.runOperationInTransaction(cb);
      if (!user) {
        logger.error(
          `user with id: ${currUserId} not found hence cannot be updated`
        );
        return res.status(404).json({ message: "User not found" });
      }

      user = await Utility.updateDoc(user, req.body as UserUpdateReqBody);
      logger.info(`user with id: ${currUserId} updated successfully!`);

      return res.status(200).json({ message: "user updated", user });
    } catch (e) {
      logger.error(e, "error occurred during updating a user's details");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [
    ...userUpdateReqBodyValidators,
    Utility.validateRequest,
    editUserDetails,
  ];

  return handlers;
}

function createJwtPayload(user: UserDocument): JwtPayload {
  let tokenVersion: number;

  if (user.tokenVersion) {
    tokenVersion = user.tokenVersion;
  } else {
    tokenVersion = 0;
  }

  const payload = {
    data: { sub: user.id, role: user.role!, version: tokenVersion },
  };

  return payload;
}

export default userController;
