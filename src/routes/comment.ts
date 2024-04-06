import { Router } from "express";
import commentController from "../controllers/comment";
import auth from "../middleware";

const commentsRouter = Router();

// authenticate all routes here
commentsRouter.use(auth.authenticateJwt);

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
