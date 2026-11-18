import Link from "next/link";

const FEATURES = [
  {
    no: "01",
    title: "逐條標出風險",
    body: "單方調整租金、押金不退、過高違約金……AI 會把對你不利的條款一條條挑出來，並依風險高低排序。",
  },
  {
    no: "02",
    title: "說清楚哪裡有問題",
    body: "不只說「有風險」，而是用白話解釋這條為什麼不利、可能造成什麼後果。",
  },
  {
    no: "03",
    title: "給你可以直接談的修改建議",
    body: "每一個風險都附上具體的改寫方向，拿去跟對方協商時更有底氣。",
  },
  {
    no: "04",
    title: "提醒缺漏的條款",
    body: "合約裡沒寫的，往往比寫了的更危險。AI 會列出建議補上的保障條款。",
  },
];

const STEPS = [
  { title: "上傳合約", body: "支援 PDF、Word（DOCX）與純文字檔，單檔 4MB 以內。" },
  { title: "AI 逐條審查", body: "辨識合約類型與當事人，逐條比對常見的不利與模糊條款。" },
  { title: "取得審查報告", body: "風險分數、問題說明、修改建議一次看完，隨時回來查閱。" },
];

const CONTRACT_TYPES = ["房屋租賃", "勞動契約", "保密協議 NDA", "承攬合約", "合作備忘錄", "買賣契約", "服務合約", "授權合約"];

const FAQ = [
  {
    q: "AI 的審查結果可以取代律師嗎？",
    a: "不行。AI 審查能幫你快速找出值得注意的地方、準備好要問的問題，但它不構成法律意見。金額大或影響重大的合約，仍建議請專業律師把關。",
  },
  {
    q: "我上傳的合約誰看得到？",
    a: "每一份合約與審查結果都綁定在你的帳號下，其他會員看不到。密碼經過 bcrypt 加密儲存，我們不會保存明文密碼。",
  },
  {
    q: "支援哪些檔案格式？",
    a: "目前支援 PDF、Word（.docx）與純文字（.txt），單一檔案上限 4MB。掃描版 PDF 也可以嘗試，但辨識品質取決於掃描清晰度。",
  },
  {
    q: "審查需要多久？",
    a: "視合約長度而定，通常在一分鐘內完成。審查期間請保持頁面開啟。",
  },
];

export default function LandingPage() {
  return (
    <main>
      {/* ───── Hero ───── */}
      <section className="paper-grid relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-paper" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24 lg:pb-28">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/70 px-3.5 py-1.5 text-xs tracking-wider text-ink-soft">
              <span className="size-1.5 rounded-full bg-seal" />
              AI 合約風險審查
            </p>
            <h1 className="mt-7 font-serif text-[2.6rem] leading-[1.15] font-black tracking-tight text-ink sm:text-6xl sm:leading-[1.1]">
              簽約之前，
              <br />
              先讀懂<span className="relative whitespace-nowrap text-seal">每一行<svg aria-hidden viewBox="0 0 200 12" className="absolute -bottom-2 left-0 h-3 w-full text-seal/60" preserveAspectRatio="none"><path d="M2 9 C 50 2, 120 2, 198 7" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" /></svg></span>。
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-ink-soft">
              上傳合約，AI 會逐條標出對你不利的條款、用白話說明問題，並給出可以直接拿去協商的修改建議。
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-[15px] font-medium text-on-ink transition-colors hover:bg-seal"
              >
                免費開始審查
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
              <Link
                href="#how"
                className="inline-flex items-center rounded-full border border-line-strong px-7 py-3.5 text-[15px] text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                了解運作方式
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted">支援 PDF · DOCX · TXT ／ 審查紀錄僅本人可見</p>
          </div>

          <HeroDocument />
        </div>
      </section>

      {/* ───── 合約類型 ───── */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:gap-10">
          <p className="shrink-0 text-xs tracking-[0.2em] text-muted">適用各種合約</p>
          <ul className="flex flex-wrap gap-x-7 gap-y-2 font-serif text-[15px] text-ink-soft">
            {CONTRACT_TYPES.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── 功能 ───── */}
      <section id="features" className="scroll-mt-16">
        <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
          <SectionHeading eyebrow="功能" title="像一位細心的律師，陪你讀完整份合約" />
          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {FEATURES.map((f) => (
              <article key={f.no} className="group bg-surface p-8 transition-colors hover:bg-paper sm:p-10">
                <span className="font-mono text-xs tracking-widest text-seal">{f.no}</span>
                <h3 className="mt-4 font-serif text-2xl font-bold text-ink">{f.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-soft">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───── 運作方式 ───── */}
      <section id="how" className="scroll-mt-16 border-y border-line bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
          <SectionHeading eyebrow="運作方式" title="三個步驟，一分鐘內拿到審查報告" />
          <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="font-serif text-7xl leading-none font-black text-line-strong">
                  {i + 1}
                </span>
                <div className="mt-5 h-px w-12 bg-seal" />
                <h3 className="mt-5 font-serif text-xl font-bold text-ink">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───── 隱私 ───── */}
      <section id="privacy" className="scroll-mt-16">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-32">
          <SectionHeading
            eyebrow="隱私"
            title="你的合約，只有你看得到"
            body="合約往往包含個資與商業機密。我們把每一份審查都綁定在你的帳號下，從資料庫查詢層就只會取出屬於你的資料。"
          />
          <ul className="space-y-4">
            {[
              ["帳號隔離", "審查紀錄與原始檔案都綁定你的帳號，其他會員無法存取。"],
              ["密碼加密", "密碼以 bcrypt 雜湊後儲存，系統中不存在明文密碼。"],
              ["安全登入", "登入狀態保存在 HttpOnly Cookie，網頁腳本無法讀取。"],
            ].map(([title, body]) => (
              <li key={title} className="flex gap-5 rounded-2xl border border-line bg-surface p-6">
                <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-seal-soft text-xs text-seal">✓</span>
                <div>
                  <h3 className="font-medium text-ink">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section id="faq" className="scroll-mt-16 border-t border-line bg-surface">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:py-32">
          <SectionHeading eyebrow="常見問題" title="使用前，你可能想知道" />
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-lg font-bold text-ink [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line-strong text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 pr-12 leading-relaxed text-ink-soft">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl bg-ink px-8 py-16 text-center sm:px-16 sm:py-20">
          <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-seal/25 blur-3xl" />
          <h2 className="relative font-serif text-3xl leading-tight font-black text-on-ink sm:text-5xl">
            下一份合約，
            <br className="sm:hidden" />
            先讓 AI 讀一遍。
          </h2>
          <p className="relative mx-auto mt-5 max-w-md text-on-ink/70">
            註冊只需要 Email，幾秒鐘就能開始第一份審查。
          </p>
          <Link
            href="/signup"
            className="relative mt-9 inline-flex items-center gap-2 rounded-full bg-seal px-8 py-3.5 font-medium text-white transition-colors hover:bg-seal-strong"
          >
            免費開始審查 →
          </Link>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="flex items-center gap-3 text-xs tracking-[0.25em] text-seal">
        <span className="h-px w-8 bg-seal" />
        {eyebrow}
      </p>
      <h2 className="mt-5 font-serif text-3xl leading-tight font-black text-balance text-ink sm:text-[2.6rem]">{title}</h2>
      {body && <p className="mt-5 text-lg leading-relaxed text-ink-soft">{body}</p>}
    </div>
  );
}

/** Hero 右側：一份被 AI 標註過的合約示意圖 */
function HeroDocument() {
  return (
    <div className="relative mx-auto w-full max-w-md animate-rise [animation-delay:150ms] lg:max-w-none">
      <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-2 rounded-2xl border border-line bg-surface-2" />
      <div className="relative rounded-2xl border border-line-strong bg-surface p-7 shadow-[0_30px_60px_-30px_rgba(26,25,21,0.35)] sm:p-9">
        <div className="flex items-center justify-between gap-4 border-b border-line pr-14 pb-4 sm:pr-16">
          <p className="font-serif text-lg font-bold text-ink">房屋租賃契約</p>
          <p className="font-mono text-[11px] text-muted">第 1 頁 / 共 3 頁</p>
        </div>
        <div className="mt-5 space-y-4 font-serif text-[14.5px] leading-[1.9] text-ink-soft">
          <p>第一條　租期自民國一一五年一月一日起至一一五年十二月三十一日止。</p>
          <p>
            第二條　每月租金新台幣貳萬伍仟元整，
            <span className="mark-risk text-ink">甲方得隨時調整租金，乙方不得異議。</span>
          </p>
          <p>
            第三條　押金為三個月租金，
            <span className="mark-risk text-ink">租期屆滿後甲方得視情況決定是否返還。</span>
          </p>
        </div>

        {/* AI 註記 */}
        <div className="mt-6 rounded-xl border border-seal/30 bg-seal-soft/60 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-seal">
            <span className="rounded-full bg-seal px-2 py-0.5 text-[10px] text-white">高風險</span>
            第二條・租金調整
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            出租人可單方面隨時調漲租金。建議改為「每年調整一次，漲幅不超過 3%，並提前 60 日書面通知」。
          </p>
        </div>

        {/* 風險印章 */}
        <div className="absolute -top-6 -right-3 animate-stamp [animation-delay:700ms] sm:-right-6">
          <div className="grid size-24 place-items-center rounded-full border-[3px] border-seal bg-surface/90 text-seal shadow-sm">
            <div className="text-center leading-none">
              <div className="font-serif text-3xl font-black">85</div>
              <div className="mt-1 text-[10px] tracking-[0.2em]">風險分數</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
