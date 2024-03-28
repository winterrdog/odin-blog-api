import express, { NextFunction, Request, Response } from "express";

const router = express.Router();

/* GET home page. */
router.get("/", function (_req: Request, res: Response, _next: NextFunction) {
  res.render("index", { title: "Express" });
});

export default router;
