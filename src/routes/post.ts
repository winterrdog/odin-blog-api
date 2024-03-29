import postController from "../controllers/post";

const postsRouter = require("express").Router();

postsRouter.route("/").get(postController.getPosts).post(postController.createPost);
postsRouter
  .route("/:id")
  .get(postController.getPostById)
  .patch(postController.updatePost)
  .delete(postController.deletePost);

export default postsRouter;
