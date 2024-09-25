import { NextFunction, Response, Request, Express } from "express";
import { startLogger } from "../logging";

const logger = startLogger(__filename);

export default applyErrorHandlers;

// ****************************************************
//            FUNCTION IMPLEMENTATIONS
// ****************************************************
function applyErrorHandlers(app: Express) {
  logger.info("setting up 404 error handler...");
  app.use(handle404Error);

  logger.info("setting up the global error handler...");
  app.use(globalErrorHandler);

  return;

  // ****************************************************
  function handle404Error(_req: Request, _res: Response, next: NextFunction) {
    const err = new Error("Not Found");
    err["status"] = 404;
    return next(err);
  }

  function globalErrorHandler(
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) {
    res.status(err.status ?? 500);
    res.json({
      message: err.message,
      error: process.env.NODE_ENV === "development" ? err : {},
    });
    return;
  }
}
