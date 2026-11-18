import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// 中文字型檔很大，不預先載入，瀏覽器會依需要的字分段下載
const notoSans = Noto_Sans_TC({
  variable: "--font-noto-sans",
  weight: ["400", "500", "700"],
  preload: false,
  display: "swap",
});
const notoSerif = Noto_Serif_TC({
  variable: "--font-noto-serif",
  weight: ["500", "700", "900"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI 合約審查器 — 簽約之前，先讀懂每一行",
  description: "上傳合約，AI 逐條標出風險條款、說明問題並提供修改建議。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSans.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <Header />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
