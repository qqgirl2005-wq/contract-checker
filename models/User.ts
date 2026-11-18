import { Schema, deleteModel, model, models, type InferSchemaType, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // 只存 bcrypt 雜湊後的密碼，永遠不存明文
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

// 開發模式 hot reload 時重新註冊，確保 schema 修改會生效
if (process.env.NODE_ENV !== "production" && models.User) {
  deleteModel("User");
}

export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) || model<UserDoc>("User", UserSchema);
