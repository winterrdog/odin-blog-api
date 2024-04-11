import { body } from "express-validator";
import { roles } from "../models/user";

export const unameValidator = body("name")
  .notEmpty()
  .withMessage("user name has to be provided.")
  .isLength({ max: 64 })
  .withMessage("username cannot exceed 64 characters.")
  .trim()
  .escape();
export const passwordValidator = body("pass")
  .notEmpty()
  .withMessage("password must be provided.");
export const roleValidator = body("role")
  .trim()
  .notEmpty()
  .withMessage("role must be provided.")
  .isIn(roles)
  .withMessage(`role should be one of: ${roles.toString()}`)
  .escape();
export const userReqBodyValidators = [
  unameValidator,
  passwordValidator,
  roleValidator,
];

// for updating requests
export const unameUpdateValidator = body("name")
  .optional()
  .isLength({ max: 64 })
  .withMessage("username cannot exceed 64 characters.")
  .trim()
  .escape();
export const roleUpdateValidator = body("role")
  .optional()
  .trim()
  .isIn(roles)
  .withMessage(`role should be one of: ${roles.toString()}`)
  .escape();
export const userUpdateReqBodyValidators = [
  unameUpdateValidator,
  roleUpdateValidator,
];
