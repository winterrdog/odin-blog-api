import * as express from "express";
import indexRouter from "./routes/index";
import { applyErrorHandlers, applyGeneralMiddleware } from "./middleware";

const app = express();
applyGeneralMiddleware(app);
app.use("/api/v1", indexRouter); // use the index router for all routes starting with /api
applyErrorHandlers(app);

export default app;
