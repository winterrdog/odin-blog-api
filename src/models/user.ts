import { Document, Schema, model } from "mongoose";

export const roles = ["author", "reader"];
export interface UserModelShape {
  name: string;
  passwordHash: string;
  role?: string;
  tokenVersion?: number;
}
export interface UserDocument extends UserModelShape, Document {}
const UserSchema = new Schema(
  {
    name: { type: String, required: true, maxLength: 64 },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: roles, default: "reader" },
    tokenVersion: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    strictQuery: "throw",
    strict: "throw",
    toJSON: { transform: toJsonHandler },
  },
);

// indexes
UserSchema.index({ name: 1 });

function toJsonHandler(_doc: any, ret: any) {
  ret.id = ret._id;
  ret.dateCreated = ret.createdAt;
  ret.dateUpdated = ret.updatedAt;

  delete ret.passwordHash;
  delete ret.createdAt;
  delete ret.updatedAt;
  delete ret.tokenVersion;
  delete ret._id;
  delete ret.__v;

  return ret;
}

// consider using "export default"
export const UserModelName = "User";
export const UserModel = model(UserModelName, UserSchema);
