import { Document, Schema, model } from "mongoose";
import { UserModelName } from "./user";

export interface PostModelShape {
  author: Schema.Types.ObjectId;
  title: string;
  body: string;
  hidden?: boolean;
  lastModified?: Date;
  views?: string[]; // store user ids in string format
  likes?: string[];
  dislikes?: string[];
}

export interface PostDocument extends PostModelShape, Document {}

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
    lastModified: { type: Date, default: Date.now },
    views: [{ type: String, default: [] }], // store user ids in string format
    likes: [{ type: String, default: [] }],
    dislikes: [{ type: String, default: [] }],
  },
  {
    timestamps: true,
    strictQuery: "throw",
    strict: "throw",
    toJSON: { transform: toJsonHandler, flattenObjectIds: true },
  }
);

// indexes
PostSchema.index({ author: 1 });

// hooks
PostSchema.pre(["find", "findOne"], function (next) {
  // NOTE: make a clone of the query object since we could
  // have executed the query multiple times already
  this.clone().populate({ path: "author", select: "name" });

  return next();
});

// triggered by a create, update, and save
PostSchema.pre("save", async function (next) {
  try {
    const session = this.$session();
    if (!session) {
      throw new Error("session is missing from the Comment document");
    }

    await this.populate({
      path: "author",
      select: "name",
      options: { session },
    });
  } catch (e) {
    console.error(`Error occurred during population on Post: ${e}`);
  }
});

export const PostModelName = "Post";
export const PostModel = model(PostModelName, PostSchema);

// *********************************************************

function toJsonHandler(doc: Document, ret: any) {
  ret.id = ret._id;
  ret.dateCreated = ret.createdAt;
  ret.dateUpdated = ret.lastModified;

  if (!!ret.author && ret.author.name) {
    ret.author = ret.author.name;
  }
  if (!!ret.views && Array.isArray(ret.views)) {
    ret.numOfViewers = ret.views.length;
    delete ret.views;
  }
  if (!!ret.likes && Array.isArray(ret.likes)) {
    ret.numOfLikes = ret.likes.length;
    delete ret.likes;
  }
  if (!!ret.dislikes && Array.isArray(ret.dislikes)) {
    ret.numOfDislikes = ret.dislikes.length;
    delete ret.dislikes;
  }

  delete ret.createdAt;
  delete ret.updatedAt;
  delete ret._id;
  delete ret.__v;

  return ret;
}
