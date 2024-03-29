import { Request, Response } from "express";

const userController = {
  // POST /sign-up
  signUp: function (req: Request, res: Response) {
    // todo
    res.send("Create a new user");
  },

  // POST /sign-in
  signIn: function (req: Request, res: Response) {
    // todo
    res.send("Sign in a user");
  },

  //   DELETE /delete
  deleteUser: function (req: Request, res: Response) {
    //   todo
    res.send("Delete a user");
  },

  //   PATCH /update
  updateUser: function (req: Request, res: Response) {
    //   todo
    res.send("Update a user");
  },
};

export default userController;
