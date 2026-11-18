"use client";

import { useEffect, useRef, useState } from "react";
import type { ContractAnalysis, RiskLevel } from "@/lib/analyzeContract";

type Review = {
  _id: string;
  fileName: string;
  fileSize: number;
  blobUrl: string;
  aiModel: string;
  analysis: ContractAnalysis;
  createdAt: string;
};

const RISK: Record<RiskLevel, { label: string; text: string; bg: string; bar: string; stroke: string }> = {
  low: { label: "低風險", text: "text-risk-low", bg: "bg-risk-low-soft", bar: "bg-risk-low", stroke: "var(--risk-low)" },
  medium: { label: "中風險", text: "text-risk-mid", bg: "bg-risk-mid-soft", bar: "bg-risk-mid", stroke: "var(--risk-mid)" },
  high: { label: "高風險", text: "text-risk-high", bg: "bg-risk-high-soft", bar: "bg-risk-high", stroke: "var(--risk-high)" },
};

const LOADING_STEPS = ["正在讀取合約內容…", "辨識合約類型與當事人…", "逐條比對風險條款…", "整理修改建議…"];
const ACCEPT = ".pdf,.docx,.txt";
const MAX_SIZE = 4 * 1024 * 1024;

async function fetchHistory(): Promise<Review[] | null> {
  try {
    const res = await fetch("/api/contracts");
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const r = RISK[level];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${r.bg} ${r.text}`}>
      <span className={`size-1.5 rounded-full ${r.bar}`} />
      {r.label}
    </span>
  );
}

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<Review | null>(null);
  const [history, setHistory] = useState<Review[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory().then((data) => {
      setHistory(data ?? []);
      setCurrent((c) => c ?? data?.[0] ?? null);
    });
  }, []);

  // 審查中輪播進度文字
  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 6000);
    return () => clearInterval(id);
  }, [loading]);

  function pickFile(f: File | undefined | null) {
    setError(null);
    if (!f) return;
    if (!/\.(pdf|docx|txt)$/i.test(f.name)) return setError("只支援 PDF、DOCX、TXT 檔案");
    if (f.size > MAX_SIZE) return setError("檔案大小不能超過 4MB");
    setFile(f);
  }

  async function handleSubmit() {
    if (!file || loading) return;
    setLoading(true);
    setStep(0);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/contracts", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "上傳失敗");

      setCurrent(data);
      setHistory((h) => [data, ...(h ?? [])]);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生未知錯誤");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-3 text-xs tracking-[0.25em] text-seal">
          <span className="h-px w-8 bg-seal" />
          我的合約
        </p>
        <h1 className="font-serif text-3xl font-black text-ink sm:text-4xl">合約審查工作台</h1>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-8">
          {/* ───── 上傳區 ───── */}
          <section
            onDragOver={(e) => {
              e.preventDefault();
              if (!loading) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (!loading) pickFile(e.dataTransfer.files?.[0]);
            }}
            className={`relative rounded-2xl border-2 border-dashed p-8 transition-colors sm:p-10 ${
              dragging ? "border-seal bg-seal-soft/50" : "border-line-strong bg-surface"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => pickFile(e.target.files?.[0])}
              disabled={loading}
            />

            {loading ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="relative size-14">
                  <div className="absolute inset-0 rounded-full border-2 border-line" />
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-seal" />
                </div>
                <p className="mt-6 font-serif text-lg font-bold text-ink">AI 審查中</p>
                <p key={step} className="mt-1 animate-rise text-sm text-muted">{LOADING_STEPS[step]}</p>
                <p className="mt-4 text-xs text-muted">通常需要 30–60 秒，請保持頁面開啟</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <FileIcon name={file.name} />
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="truncate font-medium text-ink">{file.name}</p>
                  <p className="mt-0.5 text-sm text-muted">{formatSize(file.size)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFile(null);
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                    className="rounded-full px-5 py-2.5 text-sm text-muted transition-colors hover:text-ink"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-on-ink transition-colors hover:bg-seal"
                  >
                    開始審查 →
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center py-4 text-center"
              >
                <span className="grid size-14 place-items-center rounded-full bg-paper text-2xl text-seal ring-1 ring-line">
                  ↑
                </span>
                <span className="mt-5 font-serif text-xl font-bold text-ink">拖曳合約到這裡，或點擊選擇檔案</span>
                <span className="mt-2 text-sm text-muted">PDF · DOCX · TXT ／ 4MB 以內</span>
              </button>
            )}

            {error && (
              <p className="mt-5 rounded-lg bg-risk-high-soft px-4 py-2.5 text-center text-sm text-risk-high">{error}</p>
            )}
          </section>

          {/* ───── 審查結果 ───── */}
          <div ref={resultRef} className="scroll-mt-24">
            {current ? (
              <ReviewResult key={current._id} review={current} />
            ) : (
              history && (
                <div className="rounded-2xl border border-line bg-surface px-8 py-16 text-center">
                  <p className="font-serif text-xl font-bold text-ink">還沒有審查紀錄</p>
                  <p className="mt-2 text-sm text-muted">上傳第一份合約，審查結果會出現在這裡。</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* ───── 歷史紀錄 ───── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="flex items-baseline justify-between text-sm font-medium text-ink">
            審查紀錄
            {history && <span className="font-mono text-xs text-muted">{history.length}</span>}
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
            {history === null ? (
              <div className="space-y-3 p-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-2" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted">尚無紀錄</p>
            ) : (
              <ul className="max-h-[70vh] divide-y divide-line overflow-y-auto">
                {history.map((r) => {
                  const active = current?._id === r._id;
                  return (
                    <li key={r._id}>
                      <button
                        onClick={() => {
                          setCurrent(r);
                          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className={`relative flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors ${
                          active ? "bg-paper" : "hover:bg-paper/60"
                        }`}
                      >
                        {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-seal" />}
                        <span className={`mt-1.5 size-2 shrink-0 rounded-full ${RISK[r.analysis.overallRisk].bar}`} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">{r.fileName}</span>
                          <span className="mt-0.5 block text-xs text-muted">
                            {r.analysis.contractType} · {new Date(r.createdAt).toLocaleDateString("zh-TW")}
                          </span>
                        </span>
                        <span className="font-mono text-xs text-muted">{r.analysis.riskScore}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toUpperCase() ?? "";
  return (
    <span className="relative grid h-16 w-13 shrink-0 place-items-end rounded-md border border-line-strong bg-paper pb-2">
      <span className="absolute top-0 right-0 size-4 rounded-bl-md border-b border-l border-line-strong bg-surface" />
      <span className="w-full text-center font-mono text-[10px] font-bold text-seal">{ext}</span>
    </span>
  );
}

function ScoreDial({ score, level }: { score: number; level: RiskLevel }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-32 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={RISK[level].stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(Math.max(score, 0), 100) / 100)}
          className="transition-[stroke-dashoffset] duration-1000"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className={`font-serif text-4xl leading-none font-black ${RISK[level].text}`}>{score}</div>
          <div className="mt-1.5 text-[10px] tracking-[0.2em] text-muted">風險分數</div>
        </div>
      </div>
    </div>
  );
}

function ReviewResult({ review }: { review: Review }) {
  const a = review.analysis;
  const counts = { high: 0, medium: 0, low: 0 };
  a.issues.forEach((i) => counts[i.riskLevel]++);

  return (
    <article className="animate-rise overflow-hidden rounded-2xl border border-line bg-surface">
      {/* 標頭 */}
      <header className="flex flex-col gap-6 border-b border-line p-6 sm:flex-row sm:items-center sm:p-8">
        <ScoreDial score={a.riskScore} level={a.overallRisk} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge level={a.overallRisk} />
            <span className="rounded-full border border-line px-2.5 py-1 text-xs text-ink-soft">{a.contractType}</span>
          </div>
          <h2 className="mt-3 truncate font-serif text-2xl font-bold text-ink" title={review.fileName}>
            {review.fileName}
          </h2>
          {a.parties.length > 0 && <p className="mt-1 text-sm text-muted">{a.parties.join("　·　")}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <a
              href={review.blobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-seal underline-offset-4 hover:underline"
            >
              查看原始檔案 ↗
            </a>
            <span className="text-muted">{new Date(review.createdAt).toLocaleString("zh-TW")}</span>
          </div>
        </div>
      </header>

      {/* 數量統計 */}
      <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
        {(["high", "medium", "low"] as const).map((lv) => (
          <div key={lv} className="px-4 py-4 text-center">
            <div className={`font-serif text-2xl font-black ${RISK[lv].text}`}>{counts[lv]}</div>
            <div className="mt-0.5 text-xs text-muted">{RISK[lv].label}條款</div>
          </div>
        ))}
      </div>

      <div className="space-y-10 p-6 sm:p-8">
        <Block title="摘要">
          <p className="leading-[1.9] text-ink-soft">{a.summary}</p>
        </Block>

        {a.issues.length > 0 && (
          <Block title="風險條款" count={a.issues.length}>
            <ol className="space-y-4">
              {a.issues.map((issue, i) => (
                <li key={i} className="relative overflow-hidden rounded-xl border border-line bg-paper/50 p-5 pl-6">
                  <span className={`absolute inset-y-0 left-0 w-1 ${RISK[issue.riskLevel].bar}`} />
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-serif leading-relaxed font-bold text-ink">
                      <span className="mr-2 font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                      {issue.clause}
                    </p>
                    <RiskBadge level={issue.riskLevel} />
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm leading-relaxed sm:grid-cols-[3.5rem_1fr]">
                    <dt className="text-muted">問題</dt>
                    <dd className="text-ink-soft">{issue.problem}</dd>
                    <dt className="text-muted">建議</dt>
                    <dd className="text-ink">{issue.suggestion}</dd>
                  </dl>
                </li>
              ))}
            </ol>
          </Block>
        )}

        {a.missingClauses.length > 0 && (
          <Block title="建議補充的條款" count={a.missingClauses.length}>
            <ul className="space-y-2.5">
              {a.missingClauses.map((c, i) => (
                <li key={i} className="flex gap-3 leading-relaxed text-ink-soft">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-risk-mid" />
                  {c}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {a.recommendations.length > 0 && (
          <Block title="整體建議">
            <ul className="space-y-2.5">
              {a.recommendations.map((c, i) => (
                <li key={i} className="flex gap-3 leading-relaxed text-ink-soft">
                  <span className="mt-0.5 shrink-0 text-seal">→</span>
                  {c}
                </li>
              ))}
            </ul>
          </Block>
        )}
      </div>

      <footer className="border-t border-line bg-paper/50 px-6 py-4 text-xs text-muted sm:px-8">
        由 {review.aiModel} 產生 · 僅供參考，不構成法律意見
      </footer>
    </article>
  );
}

function Block({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-4 flex items-center gap-3 font-serif text-lg font-bold text-ink">
        {title}
        {count !== undefined && <span className="font-mono text-xs font-normal text-muted">{count}</span>}
        <span className="h-px flex-1 bg-line" />
      </h3>
      {children}
    </section>
  );
}
