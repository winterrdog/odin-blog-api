// post
export interface PostReqBody {
  title: string;
  body: string;
  author: string;
  hidden?: boolean;
}
export interface PostUpdateReqBody {
  title?: string;
  body?: string;
  hidden?: boolean;
}
