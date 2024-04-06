import { Router } from "express";
import userController from "../controllers/user";
import auth from "../middleware";

const usersRouter = Router();

usersRouter.post("/sign-up", userController.signUp);
usersRouter.post("/sign-in", auth.authenticateUserPass, userController.signIn);
usersRouter.delete("/delete", auth.authenticateJwt, userController.deleteUser);
usersRouter.patch("/update", auth.authenticateJwt, userController.updateUser);

export default usersRouter;
