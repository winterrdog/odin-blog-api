import { Router } from "express";
import usersRouter from "./user";
import commentsRouter from "./comment";
import postsRouter from "./post";
import { startLogger } from "../logging";
import { auth } from "middleware";

const indexRouter = Router();
const logger = startLogger(__filename);

logger.info("setting up 'user' routes...");
indexRouter.use("/users", usersRouter);

logger.info("setting up 'post' routes...");
indexRouter.use("/posts", postsRouter);

logger.info("setting up 'comment' routes...");
indexRouter.use("/post-comments", auth.authenticateJwt, commentsRouter);

logger.info("routes setup successfully!");
export default indexRouter;
