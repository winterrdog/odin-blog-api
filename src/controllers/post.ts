import { Request, Response } from "express";

const postController = {
  // GET /posts/:id
  getPostById: function (req: Request, res: Response) {
    // todo
    res.send("Get a post by id");
  },

  // GET /posts
  getPosts: function (req: Request, res: Response) {
    // todo
    res.send("Get all posts");
  },

  // POST /posts
  createPost: function (req: Request, res: Response) {
    // todo
    res.send("Create a new post");
  },

  // PATCH /posts/:id
  updatePost: function (req: Request, res: Response) {
    // todo
    res.send("Update a post");
  },

  // DELETE /posts/:id
  deletePost: function (req: Request, res: Response) {
    // todo
    res.send("Delete a post");
  },
};

export default postController;
