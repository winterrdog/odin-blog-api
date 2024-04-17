import * as express from "express";
import indexRouter from "./routes/index";
import { applyErrorHandlers, applyGeneralMiddleware } from "./middleware";

const app = express();

// note: might be used later after getting a vision
// import { startLogger } from "./logging";
// const logger = startLogger(__filename);

applyGeneralMiddleware(app);
app.use("/api/v1", indexRouter); // use the index router for all routes starting with /api
applyErrorHandlers(app);
export default app;
