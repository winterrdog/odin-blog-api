import { NextFunction, Request, Response } from "express";
import * as fs from "fs";
import { merge } from "lodash";
import * as jwt from "jsonwebtoken";
import mongoose, {
  ClientSession,
  Connection,
  Document,
  isValidObjectId,
} from "mongoose";
import { validationResult } from "express-validator";
import { PathLike } from "fs";
import { JwtPayload } from "./middleware/interfaces";
import { startLogger } from "./logging";

const logger = startLogger(__filename);

export type TransactionCallback<T> = (session: ClientSession) => Promise<T>;

export default class Utility {
  static generateJwtPayload(payload: JwtPayload): Promise<string> {
    return new Promise((resolve, reject) => {
      logger.info("generating JWT...");

      const jwtSignCb: jwt.SignCallback = (err, token) => {
        if (err) {
          logger.error("failed to generate JWT: ", err);
          return reject(err);
        }
        logger.info("JWT generated successfully!");
        return resolve(token!);
      };

      const jwtSignOptions: jwt.SignOptions = {
        expiresIn: "3d",
        algorithm: "HS384",
      };

      jwt.sign(
        payload,
        <string>process.env.JWT_SECRET,
        jwtSignOptions,
        jwtSignCb
      );
    });
  }

  static validateRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    logger.info("validating and sanitizing request body, query, and params...");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("request validation failed: ", errors.array());
      res.status(400).json({ message: errors.array() });
      return;
    }

    logger.info("request validated successfully!");
    return next();
  }

  static createFile(fname: PathLike): Promise<void> {
    // create a file if it doesn't exist
    // if it exists, do nothing
    const cb = (resolve, reject) => {
      logger.info(`creating log file: ${fname}...`);

      fs.open(fname, "a", (err, fd) => {
        if (err) {
          logger.error(err, `failed to append to file: ${fname}`);
          return reject(err);
        }

        // just close the file if it exists
        fs.close(fd, (err) => {
          if (err) {
            logger.error(err, `failed to close file: ${fname}`);
            return reject(err);
          }
          logger.info(`log file was already created: ${fname} thus closed it.`);
          return resolve();
        });
      });
    };

    return new Promise(cb);
  }

  static arrayToSet(arr: Array<any>): Set<any> {
    return new Set(arr);
  }

  static validateObjectId(id: string, res: Response): boolean {
    if (!isValidObjectId(id)) {
      logger.error("invalid or malformed object id");
      res.status(400).json({ message: "Invalid id was provided, " + id });

      return false;
    }

    return true;
  }

  static async updateDoc(docToUpdate: Document, newData: any) {
    try {
      merge(docToUpdate, newData);

      const cb: TransactionCallback<any> = async (session) => {
        return await docToUpdate.save({ session });
      };

      return await Utility.runOperationInTransaction(cb);

      // note: no need to return doc because Objects are passed by ref in JS.
      // so any changes made to the doc are propagated to the original doc
    } catch (e) {
      throw e;
    }
  }

  static handle500Status(res: Response, err: Error): void {
    res.status(500).json({
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error occurred. Please try again later."
          : err.message,
    });
  }

  static extractUserIdFromToken(req: Request): string {
    return ((<any>req.user!).data as JwtPayload).data.sub;
  }

  static isCurrUserSameAsCreator(
    req: Request,
    res: Response,
    dbUserId: string
  ): boolean {
    const currUserId = Utility.extractUserIdFromToken(req);

    logger.info(
      `checking if user with id, ${currUserId}, is the author of the resource...`
    );

    if (currUserId !== dbUserId) {
      logger.error(`user( ${currUserId} ) is not the author of the resource`);
      res.status(403).json({
        message:
          "you are not the author of this resource so you will not update it",
      });
      return false;
    }

    return true;
  }

  static extractTokenFromCookie(req: Request): string | null {
    if (req.cookies && req.cookies["token"]) {
      return req.cookies["token"];
    }
    return null;
  }

  static setCookieGeneric(
    res: Response,
    cookieName: string,
    cookieValue: string
  ): void {
    const threeDays = 1000 * 60 * 60 * 24 * 3;

    res.cookie(cookieName, cookieValue, {
      path: "/",
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
      maxAge: threeDays,
    });
  }

  static setTokenCookie(res: Response, token: string): void {
    Utility.setCookieGeneric(res, "token", token);
  }

  static clearCookie(res: Response, cookieName: string): void {
    res.clearCookie(cookieName, {
      path: "/",
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });
  }

  static updateUserReactions(
    req: Request,
    res: Response,
    arr: Array<string>
  ): boolean {
    if (!req.user) {
      throw new Error("user's not authenticated thus user object is missing");
    }

    const currUserId = Utility.extractUserIdFromToken(req);
    const uniqueUsersReactions: Set<string> = Utility.arrayToSet(arr);

    if (!uniqueUsersReactions.has(currUserId)) {
      arr.push(currUserId);
      return true;
    }

    logger.info("the current reaction was already updated by the user");
    res.status(400).json({ message: "user reaction already updated" });
    return false;
  }

  static async runOperationInTransaction<T>(
    cb: TransactionCallback<T>,
    connection: Connection = mongoose.connection
  ): Promise<T> {
    let session: ClientSession | null = null;
    let result: T;

    try {
      session = await connection.startSession();
      const execTransactionCb = async () => {
        const res = await cb(session!);
        return res;
      };

      result = await session.withTransaction<T>(execTransactionCb);
    } catch (e) {
      throw e;
    } finally {
      if (session) {
        await session.endSession();
      }
    }

    return result;
  }
}
