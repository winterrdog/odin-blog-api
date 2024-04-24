import { Document, Schema, model } from "mongoose";
import { UserModelName } from "./user";

const PostSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: UserModelName,
      required: true,
    },
    title: { type: String, required: true, minLength: 4, maxLength: 56 },
    body: { type: String, required: true },
    hidden: { type: Boolean, default: false },
    views: [{ type: String }],
  },
  {
    timestamps: true,
    strictQuery: "throw",
    toJSON: { transform: toJsonHandler, flattenObjectIds: true },
  }
);

PostSchema.pre(["find", "findOne"], function (next) {
  // NOTE: make a clone of the query object since we could
  // have executed the query multiple times already
  this.clone().populate("author", "name");

  return next();
});

// triggered by a create, update, and save
PostSchema.pre("save", async function (next) {
  try {
    await this.populate("author", "name");
  } catch (e) {
    console.error(`Error occurred during population on Post: ${e}`);
  }
});

function toJsonHandler(doc: Document, ret: any) {
  ret.id = ret._id;
  ret.dateCreated = ret.createdAt;
  ret.dateUpdated = ret.updatedAt;

  // populate author field
  if (ret.author && ret.author.name) {
    ret.author = ret.author.name;
  }

  if (ret.views && Array.isArray(ret.views)) {
    ret.numOfViewers = ret.views.length;
    delete ret.views;
  }

  delete ret.createdAt;
  delete ret.updatedAt;
  delete ret._id;
  delete ret.__v;

  return ret;
}

export const PostModelName = "Post";
export const PostModel = model(PostModelName, PostSchema);
