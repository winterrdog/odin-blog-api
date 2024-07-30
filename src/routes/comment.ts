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
  "attaching controllers to 'comment' route: /:postId/comments/:id ...",
);
commentsRouter
  .route("/:postId/comments/:id")
  .get(commentController.getCommentById)
  .patch(auth.authenticateJwt, commentController.updateComment)
  .delete(auth.authenticateJwt, commentController.deleteComment);

// to update a Reply, just hit the 'updateComment' endpoint above
logger.info(
  "attaching controllers to 'comment' route: /:postId/comments/:id/replies ...",
);
commentsRouter.use("/:postId/comments/:id/replies", auth.authenticateJwt);
commentsRouter
  .route("/:postId/comments/:id/replies")
  .get(commentController.findReplies)
  .post(commentController.createReply);
commentsRouter
  .route("/:postId/comments/:id/replies/:replyId")
  .delete(commentController.deleteReply);

logger.info(
  "attaching controllers to 'comment' route: /:postId/comments/:id/likes and /:postId/comments/:id/dislikes ...",
);
commentsRouter.use("/:postId/comments/:id/likes", auth.authenticateJwt);
commentsRouter.use("/:postId/comments/:id/dislikes", auth.authenticateJwt);
commentsRouter
  .route("/:postId/comments/:id/likes")
  .patch(commentController.likeComment)
  .delete(commentController.removeLike);
commentsRouter
  .route("/:postId/comments/:id/dislikes")
  .patch(commentController.dislikeComment)
  .delete(commentController.removeDislike);

export default commentsRouter;
