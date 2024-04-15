import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { JwtPayload } from "./middleware/interfaces";
import { PathLike } from "fs";
import * as fs from "fs";
import { startLogger } from "./logging";

const logger = startLogger(__filename);
export default class Utility {
  static generateJwtPayload(payload: JwtPayload): Promise<string> {
    return new Promise((resolve, reject) => {
      logger.info("generating JWT...");

      jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        {
          expiresIn: "2d",
          algorithm: "HS384",
        },
        function (err, token) {
          if (err) {
            logger.error("failed to generate jwt token: ", err);
            reject(err);
          } else {
            logger.info("JWT generated successfully!");
            resolve(token as string);
          }
          return;
        }
      );
    });
  }
  static validateRequest(req: Request, res: Response, next: NextFunction) {
    logger.info("validating and sanitizing request body, query, and params...");

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      logger.info("request validated successfully!");
      next();
    } else {
      logger.error("request validation failed: ", errors.array());
      res.status(400).json({ errors: errors.array() });
    }
  }
  static createFile(fname: PathLike): Promise<void> {
    // create a file if it doesn't exist
    // if it exists, do nothing
    return new Promise((resolve, reject) => {
      // "wx" flag creates a file if it doesn't exist
      logger.info(`creating log file: ${fname}...`);
      fs.open(fname, "wx", (err, fd) => {
        if (err) {
          if (err.code === "EEXIST") {
            logger.info("log file already exists. skipping creation...");
            return resolve();
          }

          logger.error("failed to create log file: ", err);
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
    });
  }
}
