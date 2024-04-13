import { Router } from "express";
import commentController from "../controllers/comment";
import auth from "../middleware";
import { startLogger } from "../logging";

const commentsRouter = Router();
const logger = startLogger(__filename);

// authenticate all routes here
logger.info("setting up 'jwt' authentication for 'comment' routes...");
commentsRouter.use(auth.authenticateJwt);

logger.info("attaching controllers to 'comment' route: /:postId/comments ...");
commentsRouter
  .route("/:postId/comments")
  .get(commentController.getComments)
  .post(commentController.createComment);

logger.info(
  "attaching controllers to 'comment' route: /:postId/comments/:id ..."
);
commentsRouter
  .route("/:postId/comments/:id")
  .get(commentController.getCommentById)
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

export default commentsRouter;
