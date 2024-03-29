import userController from "../controllers/user";

const usersRouter = require("express").Router();

usersRouter.post("/sign-up", userController.signUp);
usersRouter.post("/sign-in", userController.signIn);
usersRouter.delete("/delete", userController.deleteUser);
usersRouter.patch("/update", userController.updateUser);

export default usersRouter;
