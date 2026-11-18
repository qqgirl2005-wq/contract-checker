import { NextResponse, connection } from "next/server";
import { put, del } from "@vercel/blob";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { ContractReview } from "@/models/ContractReview";
import { analyzeContract, AI_MODEL, SUPPORTED_TYPES } from "@/lib/analyzeContract";

export const maxDuration = 60; // AI 分析可能需要較久

// Vercel serverless function 的 request body 上限約 4.5MB
const MAX_FILE_SIZE = 4 * 1024 * 1024;

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// 上傳合約 → AI 審查 → 存到 Vercel Blob → 寫入 MongoDB
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return errorResponse("請先登入", 401);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("請以 multipart/form-data 上傳檔案", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return errorResponse("請選擇要上傳的合約檔案", 400);
  }
  // 有些瀏覽器不會提供 file.type，改用副檔名判斷
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeType =
    file.type && SUPPORTED_TYPES[file.type]
      ? file.type
      : Object.keys(SUPPORTED_TYPES).find((t) => SUPPORTED_TYPES[t] === ext);
  if (!mimeType) {
    return errorResponse("只支援 PDF、DOCX、TXT 檔案", 400);
  }
  if (file.size > MAX_FILE_SIZE) {
    return errorResponse("檔案大小不能超過 4MB", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // 1. 先做 AI 分析（最容易失敗的步驟），失敗就不用留下孤兒檔案
  let analysis;
  try {
    analysis = await analyzeContract(buffer, file.name, mimeType);
  } catch (err) {
    console.error("AI 分析失敗", err);
    return errorResponse("AI 分析失敗，請稍後再試", 502);
  }

  // 2. 上傳原始檔到 Vercel Blob
  let blob;
  try {
    blob = await put(`contracts/${file.name}`, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: mimeType,
    });
  } catch (err) {
    console.error("Vercel Blob 上傳失敗", err);
    return errorResponse("檔案儲存失敗，請稍後再試", 502);
  }

  // 3. 存到 MongoDB；若失敗，把剛上傳的 blob 刪掉
  try {
    await connectDB();
    const review = await ContractReview.create({
      userId: session.userId,
      fileName: file.name,
      fileSize: file.size,
      mimeType,
      blobUrl: blob.url,
      blobPathname: blob.pathname,
      aiModel: AI_MODEL,
      analysis,
    });
    return NextResponse.json(review.toJSON(), { status: 201 });
  } catch (err) {
    console.error("MongoDB 寫入失敗", err);
    await del(blob.url).catch(() => {});
    return errorResponse("資料庫寫入失敗，請稍後再試", 500);
  }
}

// 取得「目前登入者」最近的審查紀錄
export async function GET() {
  await connection(); // 每次請求都即時查詢，不在 build 時預先產生
  const session = await getSession();
  if (!session) return errorResponse("請先登入", 401);

  try {
    await connectDB();
    const reviews = await ContractReview.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return NextResponse.json(reviews);
  } catch (err) {
    console.error("讀取紀錄失敗", err);
    return errorResponse("讀取紀錄失敗", 500);
  }
}
