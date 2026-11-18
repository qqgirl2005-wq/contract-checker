import Link from "next/link";

/** 朱紅印章造型的 Logo */
export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-[6px] bg-seal font-serif text-[17px] font-black text-surface shadow-[inset_0_0_0_2px_color-mix(in_oklab,var(--surface)_35%,transparent)] transition-transform group-hover:-rotate-6">
        約
      </span>
      <span className="font-serif text-[17px] font-bold tracking-wide text-ink">
        AI 合約審查器
      </span>
    </Link>
  );
}
