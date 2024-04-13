import { Router } from "express";
import postController from "../controllers/post";
import auth from "../middleware";
import { startLogger } from "../logging";

const postsRouter = Router();
const logger = startLogger(__filename);

// authenticate & authorize particular routes

logger.info("attaching controllers to 'post' route: / ...");
postsRouter
  .route("/")
  .get(postController.getPosts)
  .post(auth.authenticateJwt, auth.isAuthor, postController.createPost);

logger.info("attaching controllers to 'post' route: /:id ...");
postsRouter
  .route("/:id")
  .get(postController.getPostById)
  .patch(auth.authenticateJwt, auth.isAuthor, postController.updatePost)
  .delete(auth.authenticateJwt, auth.isAuthor, postController.deletePost);

export default postsRouter;
