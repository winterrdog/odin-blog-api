import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { JwtPayload } from "./middleware/interfaces";

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
}
