import commentController from "../controllers/comment";

const commentsRouter = require("express").Router();

commentsRouter
  .route("/:postId/comments")
  .get(commentController.getComments)
  .post(commentController.createComment);
commentsRouter
  .route("/:postId/comments/:id")
  .get(commentController.getCommentById)
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

export default commentsRouter;
