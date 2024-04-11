// user
export interface UserReqBody {
  name: string;
  pass: string;
  role: string;
}
export interface UserUpdateReqBody {
  name?: string;
  pass?: string;
  role?: string;
}
