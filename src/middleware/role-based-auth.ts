import { NextFunction, Request, Response } from "express";

export function isAuthor(req: Request, res: Response, next: NextFunction) {
  return (req.user! as any).data.role === "author"
    ? next()
    : res
        .status(403)
        .json({ message: "only authors can access this resource" });
}

export function isReader(req: Request, res: Response, next: NextFunction) {
  return (req.user! as any).data.role === "reader"
    ? next()
    : res
        .status(403)
        .json({ message: "only readers can access this resource" });
}
