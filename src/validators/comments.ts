import { body, param } from "express-validator";

// validate and sanitize comment and post id string
export const postIdSanitizer = param("postId").trim().escape();
export const commentIdSanitizer = param("id").trim().escape();
export const replyIdSanitizer = param("replyId").trim().escape();
export const idSanitizers = [postIdSanitizer, commentIdSanitizer];

// validate body fields
export const sanitizeBody = body("body")
  .exists()
  .notEmpty()
  .withMessage("body has to be filled in")
  .escape();
export const sanitizeTldr = body("tldr")
  .isLength({ max: 64 })
  .withMessage("tldr allows for maximum of 64 characters")
  .trim()
  .optional()
  .escape();
export const commentBodyValidator = [sanitizeBody, sanitizeTldr];

// for updating comment requests
export const bodyUpdateValidator = body("body").optional().escape();
export const commentUpdateReqBodyValidators = [
  bodyUpdateValidator,
  sanitizeTldr,
];
