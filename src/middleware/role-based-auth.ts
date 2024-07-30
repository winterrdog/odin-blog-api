import { NextFunction, Request, Response } from "express";
import { startLogger } from "../logging";

const logger = startLogger(__filename);
export function isAuthor(req: Request, res: Response, next: NextFunction) {
  logger.info(`checking if user is an author...`);

  if ((req.user! as any).data.data.role !== "author") {
    logger.error(
      "user is not an author and therefore cannot access this resource",
    );
    res.status(403).json({ message: "only authors can access this resource" });
    return;
  }

  logger.info("user is an author hence proceeding to access resource");
  return next();
}
export function isReader(req: Request, res: Response, next: NextFunction) {
  logger.info(`checking if user is a reader...`);

  if ((req.user! as any).data.role !== "reader") {
    logger.error(
      "user is 'not a reader' and therefore cannot access this resource",
    );
    res.status(403).json({ message: "only readers can access this resource" });
    return;
  }

  logger.info("user is a 'reader' hence proceeding to access resource");
  return next();
}
