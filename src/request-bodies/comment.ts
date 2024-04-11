// comment
export interface CommentReqBody {
  body: string;
  user: string;
  post: string;
  tldr?: string;
}
export interface CommentUpdateReqBody {
  body?: string;
  tldr?: string;
}
