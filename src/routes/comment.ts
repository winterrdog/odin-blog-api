import { Router } from "express";
import commentController from "../controllers/comment";
import { auth } from "../middleware";
import { startLogger } from "../logging";

const commentsRouter = Router();
const logger = startLogger(__filename);

logger.info("attaching controllers to 'comment' route: /:postId/comments ...");
commentsRouter
  .route("/:postId/comments")
  .get(commentController.getComments)
  .post(auth.authenticateJwt, commentController.createComment);

logger.info(
  "attaching controllers to 'comment' route: /:postId/comments/:id ..."
);
commentsRouter
  .route("/:postId/comments/:id")
  .get(commentController.getCommentById)
  .patch(auth.authenticateJwt, commentController.updateComment)
  .delete(auth.authenticateJwt, commentController.deleteComment);

export default commentsRouter;
