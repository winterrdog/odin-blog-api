import express from "express";
import commentController from "../controllers/comment";

const router = express.Router();

router
  .route("/:postId/comments")
  .get(commentController.getComments)
  .post(commentController.createComment);
router
  .route("/:postId/comments/:id")
  .get(commentController.getCommentById)
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

export default router;
