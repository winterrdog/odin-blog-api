import userPassStrategy from "./user-pass-auth";
import jwtStrategy from "./jwt-auth";

const auth = {
  userPassStrategy,
  jwtStrategy,
};

export default auth;
