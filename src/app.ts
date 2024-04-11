import * as express from "express";
import * as cors from "cors";
import * as dotenv from "dotenv";
import helmet from "helmet";
import { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import indexRouter from "./routes/index";

dotenv.config();

const app = express();
app.use(express.json()); // parse application/json
app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(cors()); // allow cross-origin requests
app.use(helmet()); // set security headers
app.use(
  rateLimit({
    windowMs: 20 * 60 * 1000, // 20 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message:
      "Too many requests from this IP, please try again after 20 minutes",
    statusCode: 429,
  })
); // limit repeated requests to avoid abuse of the API
app.use("/api", indexRouter); // use the index router for all routes starting with /api

// catch 404 and forward to error handler
app.use(function (_req: Request, _res: Response, next: NextFunction) {
  const err = new Error("Not Found");

  (err as any)["status"] = 404;
  return next(err);
});

// error handler
app.use(function (err: any, _req: Request, res: Response, _next: NextFunction) {
  res.status(err.status ?? 500);
  res.json({
    message: err.message,
    error: process.env.NODE_ENV === "development" ? err : {},
  });

  return;
});

export default app;
