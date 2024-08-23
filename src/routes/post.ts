import { Router } from "express";
import postController from "../controllers/post";
import { auth } from "../middleware";
import { startLogger } from "../logging";

const postsRouter = Router();
const logger = startLogger(__filename);

logger.info("attaching controllers to 'post' route: / ...");
postsRouter
  .route("/")
  .get(postController.getPosts)
  .post(auth.authenticateJwt, auth.isAuthor, postController.createPost);

postsRouter.use(auth.authenticateJwt);

postsRouter.get("/user-posts", postController.getUserPosts);
postsRouter.get("/liked-posts", postController.getLikedPosts);
postsRouter.get("/recently-viewed", postController.getRecentlyViewedPosts);

logger.info("attaching controllers to 'post' route: /:id ...");
postsRouter
  .route("/:id")
  .get(postController.getPostById)
  .patch(auth.isAuthor, postController.updatePost)
  .delete(auth.isAuthor, postController.deletePost);

logger.info(
  "attaching controllers to 'post' route: /:id/likes & /:id/dislikes ..."
);
postsRouter
  .route("/:id/likes")
  .patch(postController.updateLikes)
  .delete(postController.removeLike);
postsRouter
  .route("/:id/dislikes")
  .patch(postController.updateDislikes)
  .delete(postController.removeDislike);

export default postsRouter;
