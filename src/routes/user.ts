import { Router } from "express";
import userController from "../controllers/user";
import { auth } from "../middleware";
import { startLogger } from "../logging";

const usersRouter = Router();
const logger = startLogger(__filename);

logger.info("attaching controllers to 'user' route: /sign-up ...");
usersRouter.post("/sign-up", userController.signUp);

logger.info("attaching controllers to 'user' route: /sign-in ...");
usersRouter.post("/sign-in", auth.authenticateUserPass, userController.signIn);

logger.info("attaching controllers to 'user' route: /delete ...");
usersRouter.delete("/delete", auth.authenticateJwt, userController.deleteUser);

logger.info("attaching controllers to 'user' route: /update ...");
usersRouter.patch("/update", auth.authenticateJwt, userController.updateUser);

export default usersRouter;
