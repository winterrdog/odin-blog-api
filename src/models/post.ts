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
  },
  {
    timestamps: true,
    strictQuery: "throw",
    toJSON: { transform: toJsonHandler, flattenObjectIds: true },
  }
);

PostSchema.pre(["find", "findOne"], async function (next) {
  await this.populate("author", "name");
  next();
});
// triggered by a create, update, and save
PostSchema.pre("save", async function (next) {
  await this.populate("author", "name");
  next();
});

function toJsonHandler(doc: Document, ret: any) {
  ret.id = ret._id;
  ret.dateCreated = ret.createdAt;
  ret.dateUpdated = ret.updatedAt;

  // populate author field
  if (ret.author && ret.author.name) {
    ret.author = ret.author.name;
  }

  delete ret.createdAt;
  delete ret.updatedAt;
  delete ret._id;
  delete ret.__v;

  return ret;
}

export const PostModelName = "Post";
export const PostModel = model(PostModelName, PostSchema);
