import {
  CallbackWithoutResultAndOptionalError,
  Document,
  Schema,
  model,
  Types,
} from "mongoose";
import { UserModelName } from "./user";
import { PostModelName } from "./post";

export interface CommentModelShape {
  user: Types.ObjectId;
  post: Types.ObjectId;
  parentComment?: Types.ObjectId;
  childComments?: Types.ObjectId[];
  detachedchildComments?: Types.ObjectId[];
  deleted?: boolean;
  body: string;
  tldr?: string;
  lastModified?: Date;
  dislikes?: string[];
  likes?: string[];
}
export interface CommentDocument extends CommentModelShape, Document {}

const CommentModelName = "Comment";

const CommentSchema = new Schema(
  {
    body: { type: String, required: true },
    tldr: { type: String, default: "nil", maxLength: 64 },
    user: { type: Schema.Types.ObjectId, ref: UserModelName, required: true },
    post: { type: Schema.Types.ObjectId, ref: PostModelName, required: true },
    deleted: { type: Boolean, default: false },
    lastModified: { type: Date, default: Date.now },
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
    strict: "throw",
    toJSON: { transform: toJsonHandler, flattenObjectIds: true },
  },
);

// indexes
CommentSchema.index({ user: 1 });
CommentSchema.index({ post: 1 });

// hooks
CommentSchema.pre(
  ["find", "findOne"],
  function (next: CallbackWithoutResultAndOptionalError) {
    this.clone().populate({ path: "user", select: "name" });

    return next();
  },
);
CommentSchema.pre("save", async function (this: Document) {
  try {
    const session = this.$session();
    if (!session) {
      throw new Error("session is missing from the Comment document");
    }

    await this.populate({ path: "user", select: "name", options: { session } });
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
  ret.dateUpdated = ret.lastModified;

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
