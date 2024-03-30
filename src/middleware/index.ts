// todo: add authentication middleware via passport-jwt
// todo: add authorization middleware

import userPassStrategy from "./user-pass-auth";

const auth = {
  userPassStrategy,
};
export default auth;
