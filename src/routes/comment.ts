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

logger.info(
  "attaching controllers to 'comment' route: /:postId/comments/:id/replies ..."
);
commentsRouter.use("/:postId/comments/:id/replies", auth.authenticateJwt);
commentsRouter
  .route("/:postId/comments/:id/replies")
  .get(commentController.findReplies)
  .post(commentController.createReply);
commentsRouter
  .route("/:postId/comments/:id/replies/:replyId")
  .patch(commentController.updateReply)
  .delete(commentController.deleteReply);

export default commentsRouter;
