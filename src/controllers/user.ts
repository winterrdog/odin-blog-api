import { Request, Response } from "express";
import _ from "lodash";
import * as argon2 from "argon2";
import { JwtPayload } from "../middleware/interfaces";
import { UserModel } from "../models/user";
import Utility from "../utilities";

// todo: introduce data validation and sanitization

const userController = {
  signUp: async function (req: Request, res: Response) {
    try {
      // collect details
      const { name, password, role } = req.body;

      // check if user with name already exists
      {
        const user = await UserModel.findOne({ name });
        if (user) {
          return res.status(409).json({
            message:
              "User with name already exists. Try using a different name.",
          });
        }
      }

      const passwordHash = await argon2.hash(password as string);

      // store details in db
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
      return res.status(201).json({
        message: "User created successfully",
        token: await Utility.generateJwtPayload(jwtPayload),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message:
          process.env.NODE_ENV === "production"
            ? "Internal server error occurred. Please try again later."
            : (err as Error).message,
      });
    }
  },
  signIn: async function (req: Request, res: Response) {
    try {
      const { name, password } = req.body;
      const user = await UserModel.findOne({ name });
      if (!user) {
        return res
          .status(404)
          .json({ message: `user with username: ${name} was not found.` });
      }

      const isPasswordValid = await argon2.verify(user.passwordHash, password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // craft jwt and send it back
      const jwtPayload: JwtPayload = {
        data: {
          sub: user.id,
          role: user.role,
        },
      };
      return res.status(200).json({
        message: "User signed in successfully",
        token: await Utility.generateJwtPayload(jwtPayload),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message:
          process.env.NODE_ENV === "production"
            ? "Internal server error occurred. Please try again later."
            : (err as Error).message,
      });
    }
  },
  deleteUser: async function (req: Request, res: Response) {
    try {
      // grab their user id from jwt
      const { data } = (req.user! as any).data as JwtPayload;
      const { sub } = data;

      // check if user with id exists
      const user = await UserModel.findById(sub);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      await user.deleteOne();
      return res.status(204).json({
        message: "User deleted successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message:
          process.env.NODE_ENV === "production"
            ? "Internal server error occurred. Please try again later."
            : (err as Error).message,
      });
    }
  },
  updateUser: async function (req: Request, res: Response) {
    try {
      // grab their user id from jwt
      const { data } = (req.user! as any).data as JwtPayload;
      const { sub } = data;

      // check if user with id exists
      let user = await UserModel.findById(sub);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // merge data to update
      user = _.merge(user, req.body);
      await user!.save();
      return res.status(200).json({
        message: "User updated",
        user,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message:
          process.env.NODE_ENV === "production"
            ? "Internal server error occurred. Please try again later."
            : (err as Error).message,
      });
    }
  },
};

export default userController;
