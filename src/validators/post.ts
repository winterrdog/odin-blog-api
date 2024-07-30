import { body, param } from "express-validator";

export const postIdSanitizer = param("id").trim().escape();

// validate and sanitize body
export const titleValidator = body("title")
  .trim()
  .isLength({ min: 4, max: 56 })
  .withMessage("title should have 4 to 56 characters.")
  .escape();
export const postBodyValidator = body("body")
  .trim()
  .notEmpty()
  .withMessage("body has to be provided.")
  .escape();
export const hiddenValidator = body("hidden").trim().optional().escape();
export const postReqBodyValidators = [
  titleValidator,
  postBodyValidator,
  hiddenValidator,
];

// for updating post requests
export const titleUpdateValidator = body("title")
  .optional()
  .trim()
  .isLength({ min: 4, max: 56 })
  .withMessage("title should have 4 to 56 characters.")
  .escape();
export const postBodyUpdateValidator = body("body").optional().trim().escape();
export const postUpdateReqBodyValidators = [
  titleUpdateValidator,
  postBodyUpdateValidator,
  hiddenValidator,
];
