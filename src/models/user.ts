import { Schema, model } from "mongoose";

export const roles = ["author", "reader"];
export interface UserModelShape {
  name: string;
  passwordHash: string;
  role?: string;
}
const UserSchema = new Schema(
  {
    name: { type: String, required: true, maxLength: 64 },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: roles,
      default: "reader",
    },
  },
  {
    timestamps: true,
    strictQuery: "throw",
    toJSON: { transform: toJsonHandler },
  },
);

function toJsonHandler(_doc: any, ret: any) {
  ret.id = ret._id;
  ret.dateCreated = ret.createdAt;
  ret.dateUpdated = ret.updatedAt;

  delete ret.passwordHash;
  delete ret.createdAt;
  delete ret.updatedAt;
  delete ret._id;
  delete ret.__v;

  return ret;
}

// consider using "export default"
export const UserModelName = "User";
export const UserModel = model(UserModelName, UserSchema);
