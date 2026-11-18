import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            簽約之前，先讓 AI 讀過每一行。逐條標出風險、說明問題、給出修改建議。
          </p>
        </div>
        <div>
          <h3 className="text-xs font-medium tracking-[0.2em] text-muted">產品</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            <li><Link href="/#features" className="hover:text-seal">功能</Link></li>
            <li><Link href="/#how" className="hover:text-seal">運作方式</Link></li>
            <li><Link href="/#faq" className="hover:text-seal">常見問題</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-medium tracking-[0.2em] text-muted">帳號</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            <li><Link href="/signup" className="hover:text-seal">註冊</Link></li>
            <li><Link href="/login" className="hover:text-seal">登入</Link></li>
            <li><Link href="/dashboard" className="hover:text-seal">我的合約</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:justify-between sm:px-6">
          <p>© AI 合約審查器</p>
          <p>AI 審查結果僅供參考，不構成法律意見。重要合約請諮詢專業律師。</p>
        </div>
      </div>
    </footer>
  );
}
