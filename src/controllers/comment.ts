import { Request, Response } from "express";

const commentController = {
  // GET /:postId/comments/:id
  getCommentById: function (req: Request, res: Response) {
    // todo
    res.send("Get a comment by id");
  },

  // GET /:postId/comments
  getComments: function (req: Request, res: Response) {
    // todo
    res.send("Get all comments");
  },

  // POST /:postId/comments
  createComment: function (req: Request, res: Response) {
    // todo
    res.send("Create a new comment");
  },

  // PATCH /:postId/comments/:id
  updateComment: function (req: Request, res: Response) {
    // todo
    res.send("Update a comment");
  },

  // DELETE /:postId/comments/:id
  deleteComment: function (req: Request, res: Response) {
    // todo
    res.send("Delete a comment");
  },
};

export default commentController;
