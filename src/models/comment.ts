import {
  CallbackWithoutResultAndOptionalError,
  Document,
  Schema,
  model,
} from "mongoose";
import { UserModelName } from "./user";
import { PostModelName } from "./post";

export interface CommentModelShape {
  user: Schema.Types.ObjectId;
  post: Schema.Types.ObjectId;
  parentComment?: Schema.Types.ObjectId;
  childComments?: Schema.Types.ObjectId[];
  detachedchildComments?: Schema.Types.ObjectId[];
  deleted?: boolean;
  body: string;
  tldr?: string;
  dislikes?: string[];
  likes?: string[];
}
const CommentModelName = "Comment";
const CommentSchema = new Schema(
  {
    body: { type: String, required: true },
    tldr: { type: String, default: "nil", maxLength: 64 },
    user: {
      type: Schema.Types.ObjectId,
      ref: UserModelName,
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: PostModelName,
      required: true,
    },
    deleted: { type: Boolean, default: false },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: CommentModelName,
      default: null,
    },
    childComments: [
      { type: Schema.Types.ObjectId, ref: CommentModelName, default: [] },
    ],
    detachedchildComments: [
      { type: Schema.Types.ObjectId, ref: CommentModelName, default: [] },
    ],
    likes: [{ type: String, default: [] }],
    dislikes: [{ type: String, default: [] }],
  },
  {
    timestamps: true,
    strictQuery: "throw",
    toJSON: { transform: toJsonHandler, flattenObjectIds: true },
  },
);

// hooks
CommentSchema.pre(
  ["find", "findOne"],
  function (next: CallbackWithoutResultAndOptionalError) {
    this.clone().populate({
      path: "user",
      select: "name",
    });
    return next();
  },
);
CommentSchema.pre("save", async function (this: Document) {
  try {
    await this.populate({
      path: "user",
      select: "name",
    });
  } catch (e) {
    console.error(
      "error during post middleware on saving a comment",
      e as Error,
    );
  }
});
function toJsonHandler(doc: Document, ret: any) {
  // NOTE: never mark this function as 'async'
  ret.id = ret._id;
  ret.dateCreated = ret.createdAt;
  ret.dateUpdated = ret.updatedAt;

  if (ret.user && ret.user.name) {
    ret.user = ret.user.name;
  }
  if (ret.likes && Array.isArray(ret.likes)) {
    ret.numOfLikes = ret.likes.length;
    delete ret.likes;
  }
  if (ret.dislikes && Array.isArray(ret.dislikes)) {
    ret.numOfDislikes = ret.dislikes.length;
    delete ret.dislikes;
  }

  delete ret.createdAt;
  delete ret.updatedAt;
  delete ret._id;
  delete ret.__v;

  return ret;
}
export const CommentModel = model(CommentModelName, CommentSchema);
