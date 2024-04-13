import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { JwtPayload } from "./middleware/interfaces";
import { PathLike } from "fs";
import * as fs from "fs";

export default class Utility {
  static generateJwtPayload(payload: JwtPayload): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        {
          expiresIn: "2d",
          algorithm: "HS384",
        },
        function (err, token) {
          return err ? reject(err) : resolve(token as string);
        }
      );
    });
  }
  static validateRequest(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    return errors.isEmpty()
      ? next()
      : res.status(400).json({ errors: errors.array() });
  }
  static createFile(fname: PathLike): Promise<void> {
    // create a file if it doesn't exist
    // if it exists, do nothing
    return new Promise((resolve, reject) => {
      // "wx" flag creates a file if it doesn't exist
      fs.open(fname, "wx", (err, fd) => {
        if (err) {
          if (err.code === "EEXIST") return resolve();
          return reject(err);
        }

        // just close the file if it exists
        fs.close(fd, (err) => {
          if (err) return reject(err);
          return resolve();
        });
      });
    });
  }
}
