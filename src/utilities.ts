import { JwtPayload } from "./middleware/interfaces";
import * as jwt from "jsonwebtoken";

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
}
