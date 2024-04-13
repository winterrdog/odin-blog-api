import * as express from "express";
import { NextFunction, Request, Response } from "express";
import indexRouter from "./routes/index";
import { startLogger } from "./logging";
import { applyGeneralMiddleware } from "./middleware";

const app = express();
const logger = startLogger(__filename);

logger.info("starting app middleware...");
applyGeneralMiddleware(app);

logger.info("setting up routes...");
app.use("/api", indexRouter); // use the index router for all routes starting with /api

logger.info("setting up 404 error handler...");
app.use(function (_req: Request, _res: Response, next: NextFunction) {
  const err = new Error("Not Found");

  (err as any)["status"] = 404;
  return next(err);
});

logger.info("setting up the global error handler...");
app.use(function (err: any, _req: Request, res: Response, _next: NextFunction) {
  res.status(err.status ?? 500);
  res.json({
    message: err.message,
    error: process.env.NODE_ENV === "development" ? err : {},
  });

  return;
});

export default app;
