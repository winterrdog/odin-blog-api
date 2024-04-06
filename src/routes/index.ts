import { Router } from "express";
import usersRouter from "./user";
import commentsRouter from "./comment";
import postsRouter from "./post";

const indexRouter = Router();

indexRouter.use("/users", usersRouter);
indexRouter.use("/posts", postsRouter);
indexRouter.use("/post-comments", commentsRouter);

export default indexRouter;
