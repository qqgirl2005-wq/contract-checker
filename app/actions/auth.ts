"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { createSession, deleteSession } from "@/lib/session";
import { User } from "@/models/User";

export type AuthState = { error?: string; email?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(formData);
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!EMAIL_RE.test(email)) return { error: "請輸入有效的 Email", email };
  if (password.length < 8) return { error: "密碼至少需要 8 個字元", email };
  // bcrypt 只會使用前 72 bytes，超過的部分會被忽略
  if (Buffer.byteLength(password) > 72) return { error: "密碼太長，請縮短一些", email };
  if (password !== confirm) return { error: "兩次輸入的密碼不一致", email };

  try {
    await connectDB();
    if (await User.exists({ email })) return { error: "這個 Email 已經註冊過了", email };

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });
    await createSession({ userId: user._id.toString(), email: user.email });
  } catch (err) {
    // 兩個請求同時註冊同一個 email 時，unique index 會擋下
    if ((err as { code?: number }).code === 11000) {
      return { error: "這個 Email 已經註冊過了", email };
    }
    console.error("註冊失敗", err);
    return { error: "註冊失敗，請稍後再試", email };
  }

  redirect("/dashboard");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(formData);
  if (!email || !password) return { error: "請輸入 Email 和密碼", email };

  try {
    await connectDB();
    const user = await User.findOne({ email });
    // 不透露是帳號不存在還是密碼錯誤
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!user || !ok) return { error: "Email 或密碼錯誤", email };

    await createSession({ userId: user._id.toString(), email: user.email });
  } catch (err) {
    console.error("登入失敗", err);
    return { error: "登入失敗，請稍後再試", email };
  }

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
