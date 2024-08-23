import { Router } from "express";
import commentController from "../controllers/comment";
import { startLogger } from "../logging";

const commentsRouter = Router();
const logger = startLogger(__filename);

logger.info("attaching controllers to 'comment' route: /:postId/comments ...");

commentsRouter
  .route("/:postId/comments")
  .get(commentController.getComments)
  .post(commentController.createComment);

commentsRouter.get("/user-comments", commentController.getUserComments);
commentsRouter.get(
  "/user-liked-comments",
  commentController.getUserLikedComments
);

logger.info(
  "attaching controllers to 'comment' route: /:postId/comments/:id ..."
);

commentsRouter
  .route("/:postId/comments/:id")
  .get(commentController.getCommentById)
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

// to update a Reply, just hit the 'updateComment' endpoint above
logger.info(
  "attaching controllers to 'comment' route: /:postId/comments/:id/replies ..."
);

commentsRouter
  .route("/:postId/comments/:id/replies")
  .get(commentController.findReplies)
  .post(commentController.createReply);
commentsRouter
  .route("/:postId/comments/:id/replies/:replyId")
  .delete(commentController.deleteReply);

logger.info(
  "attaching controllers to 'comment' route: /:postId/comments/:id/likes and /:postId/comments/:id/dislikes ..."
);

commentsRouter
  .route("/:postId/comments/:id/likes")
  .patch(commentController.likeComment)
  .delete(commentController.removeLike);
commentsRouter
  .route("/:postId/comments/:id/dislikes")
  .patch(commentController.dislikeComment)
  .delete(commentController.removeDislike);

export default commentsRouter;
