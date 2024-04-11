import { Document, Schema, model } from "mongoose";
import { UserModelName } from "./user";
import { PostModelName } from "./post";

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
  },
  {
    timestamps: true,
    strictQuery: "throw",
    toJSON: { transform: toJsonHandler, flattenObjectIds: true },
  }
);

async function toJsonHandler(doc: Document, ret: any) {
  ret.id = ret._id;

  // populate user and post fields
  await doc.populate({ path: "user", select: "name" });

  // populate post's id field
  await doc.populate({ path: "post", select: "_id" });

  ret.user = ret.user.name;
  ret.post = ret.post._id;
  ret.dateCreated = ret.createdAt;
  ret.dateUpdated = ret.updatedAt;

  delete ret._id;
  delete ret.__v;
  delete ret.createdAt;
  delete ret.updatedAt;

  return ret;
}

export const CommentModel = model("Comment", CommentSchema);
