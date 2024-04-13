import { isAuthor, isReader } from "./role-based-auth";
import applyGeneralMiddleware from "./general";
import {
  authenticateUserPass,
  authenticateJwt,
  initialize,
} from "./passport-auth";
const auth = {
  initialize,
  authenticateUserPass,
  authenticateJwt,
  isAuthor,
  isReader,
};
export { auth, applyGeneralMiddleware };
