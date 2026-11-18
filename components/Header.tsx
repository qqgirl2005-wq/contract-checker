import Link from "next/link";
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { logout } from "@/app/actions/auth";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          <Link href="/#features" className="transition-colors hover:text-ink">功能</Link>
          <Link href="/#how" className="transition-colors hover:text-ink">運作方式</Link>
          <Link href="/#privacy" className="transition-colors hover:text-ink">隱私</Link>
          <Link href="/#faq" className="transition-colors hover:text-ink">常見問題</Link>
        </nav>
        {/* 讀 cookie 的部分放在 Suspense 裡，header 其他部分可以先顯示 */}
        <Suspense fallback={<div className="h-9 w-32" />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}

async function UserMenu() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <Link href="/login" className="rounded-full px-4 py-2 text-ink-soft transition-colors hover:text-ink">
          登入
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-ink px-4 py-2 font-medium text-on-ink transition-colors hover:bg-seal"
        >
          免費開始
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm">
      <Link
        href="/dashboard"
        className="rounded-full bg-ink px-4 py-2 font-medium text-on-ink transition-colors hover:bg-seal"
      >
        我的合約
      </Link>
      <span className="hidden max-w-44 truncate pl-2 text-muted lg:inline" title={session.email}>
        {session.email}
      </span>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-full px-3 py-2 text-muted transition-colors hover:text-seal"
        >
          登出
        </button>
      </form>
    </div>
  );
}
