import express from "express";
import userController from "../controllers/user";

const router = express.Router();

router.post("/sign-up", userController.signUp);
router.post("/sign-in", userController.signIn);
router.delete("/delete", userController.deleteUser);
router.patch("/update", userController.updateUser);

export default router;
