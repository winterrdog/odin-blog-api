import usersRouter from "./user";
import commentsRouter from "./comment";
import postsRouter from "./post";

const indexRouter = require("express").Router();

indexRouter.use("/users", usersRouter);
indexRouter.use("/posts", postsRouter);
indexRouter.use("/post-comments", commentsRouter);

export default indexRouter;
