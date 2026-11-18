"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";

const inputClass =
  "mt-2 block w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-ink outline-none transition placeholder:text-muted/60 focus:border-ink focus:ring-4 focus:ring-ink/5";

const POINTS = ["逐條標出對你不利的條款", "白話說明問題與可能後果", "可直接拿去協商的修改建議"];

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const [state, action, pending] = useActionState(isSignup ? signup : login, undefined);

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
      {/* 左側品牌區（大螢幕才顯示） */}
      <section className="relative hidden h-full min-h-[520px] overflow-hidden rounded-3xl bg-ink p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-seal/30 blur-3xl" />
        <p className="relative text-xs tracking-[0.25em] text-on-ink/60">AI 合約審查器</p>
        <div className="relative">
          <h2 className="font-serif text-4xl leading-tight font-black text-on-ink">
            簽約之前，
            <br />
            先讀懂每一行。
          </h2>
          <ul className="mt-10 space-y-4">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-on-ink/80">
                <span className="grid size-5 place-items-center rounded-full bg-seal text-[10px] text-white">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-on-ink/50">審查紀錄僅本人可見 · 密碼加密儲存</p>
      </section>

      {/* 表單 */}
      <section className="mx-auto w-full max-w-sm animate-rise">
        <h1 className="font-serif text-3xl font-black text-ink">{isSignup ? "建立帳號" : "歡迎回來"}</h1>
        <p className="mt-2 text-muted">{isSignup ? "註冊後即可開始審查你的第一份合約。" : "登入以查看你的合約審查紀錄。"}</p>

        <form action={action} className="mt-10 space-y-5">
          <label className="block text-sm font-medium text-ink-soft">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              defaultValue={state?.email}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium text-ink-soft">
            密碼
            <input
              name="password"
              type="password"
              required
              minLength={isSignup ? 8 : undefined}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? "至少 8 個字元" : undefined}
              className={inputClass}
            />
          </label>
          {isSignup && (
            <label className="block text-sm font-medium text-ink-soft">
              確認密碼
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputClass}
              />
            </label>
          )}

          {state?.error && (
            <p role="alert" className="rounded-xl bg-risk-high-soft px-4 py-3 text-sm text-risk-high">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-ink px-4 py-3.5 font-medium text-on-ink transition-colors hover:bg-seal disabled:opacity-50"
          >
            {pending ? "處理中…" : isSignup ? "建立帳號" : "登入"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted">
          {isSignup ? "已經有帳號了？" : "還沒有帳號？"}
          <Link
            href={isSignup ? "/login" : "/signup"}
            className="ml-1 font-medium text-seal underline-offset-4 hover:underline"
          >
            {isSignup ? "登入" : "免費註冊"}
          </Link>
        </p>
      </section>
    </main>
  );
}
