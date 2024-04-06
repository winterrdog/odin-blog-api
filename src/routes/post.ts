import { Router } from "express";
import postController from "../controllers/post";
import auth from "../middleware";

const postsRouter = Router();

// authenticate & authorize particular routes

postsRouter
  .route("/")
  .get(postController.getPosts)
  .post(auth.authenticateJwt, auth.isAuthor, postController.createPost);

postsRouter
  .route("/:id")
  .get(postController.getPostById)
  .patch(auth.authenticateJwt, auth.isAuthor, postController.updatePost)
  .delete(auth.authenticateJwt, auth.isAuthor, postController.deletePost);

export default postsRouter;
