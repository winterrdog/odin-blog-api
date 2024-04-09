export interface CommentReqBody {
  body: string;
  user: string;
  post: string;
  tldr?: string;
}
