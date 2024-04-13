import { isAuthor, isReader } from "./role-based-auth";
import applyGeneralMiddleware from "./general";
import {
  authenticateUserPass,
  authenticateJwt,
  initialize,
} from "./passport-auth";
import applyErrorHandlers from "./errors";
const auth = {
  initialize,
  authenticateUserPass,
  authenticateJwt,
  isAuthor,
  isReader,
};
export { auth, applyGeneralMiddleware, applyErrorHandlers };
