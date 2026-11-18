import OpenAI from "openai";
import mammoth from "mammoth";
import type { ResponseInputContent } from "openai/resources/responses/responses";

export type RiskLevel = "low" | "medium" | "high";

export type ContractAnalysis = {
  contractType: string;
  parties: string[];
  summary: string;
  overallRisk: RiskLevel;
  riskScore: number;
  issues: { clause: string; riskLevel: RiskLevel; problem: string; suggestion: string }[];
  missingClauses: string[];
  recommendations: string[];
};

export const AI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

export const SUPPORTED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
};

const riskEnum = { type: "string", enum: ["low", "medium", "high"] };

// OpenAI Structured Outputs：強制模型回傳符合這個 schema 的 JSON
const analysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "contractType",
    "parties",
    "summary",
    "overallRisk",
    "riskScore",
    "issues",
    "missingClauses",
    "recommendations",
  ],
  properties: {
    contractType: { type: "string", description: "合約類型，例如：租賃合約、勞動契約、NDA" },
    parties: { type: "array", items: { type: "string" }, description: "合約當事人" },
    summary: { type: "string", description: "合約重點摘要，約 100-200 字" },
    overallRisk: riskEnum,
    riskScore: { type: "integer", description: "0-100，越高風險越大" },
    issues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["clause", "riskLevel", "problem", "suggestion"],
        properties: {
          clause: { type: "string", description: "有問題的條款原文或條號" },
          riskLevel: riskEnum,
          problem: { type: "string", description: "為什麼有風險" },
          suggestion: { type: "string", description: "建議如何修改" },
        },
      },
    },
    missingClauses: { type: "array", items: { type: "string" }, description: "建議補充但缺漏的條款" },
    recommendations: { type: "array", items: { type: "string" }, description: "整體建議" },
  },
} as const;

const SYSTEM_PROMPT = `你是一位經驗豐富的合約審查律師。請仔細審查使用者提供的合約，找出對簽約方不利、模糊、或有法律風險的條款，並提出具體的修改建議。
- 一律使用繁體中文回答。
- issues 依風險高低排序，最多列出 15 項。
- 如果文件看起來不是合約，請在 summary 說明，並將 riskScore 設為 0、issues 留空。
- 你的審查僅供參考，不構成正式法律意見。`;

let client: OpenAI | null = null;
function getClient() {
  if (!process.env.OPENAI_API_KEY) throw new Error("缺少環境變數 OPENAI_API_KEY");
  client ??= new OpenAI();
  return client;
}

async function buildContractInput(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ResponseInputContent> {
  const kind = SUPPORTED_TYPES[mimeType];

  if (kind === "pdf") {
    // PDF 直接交給 OpenAI 解析（含文字與頁面影像）
    return {
      type: "input_file",
      filename: fileName,
      file_data: `data:application/pdf;base64,${buffer.toString("base64")}`,
    };
  }

  const text =
    kind === "docx"
      ? (await mammoth.extractRawText({ buffer })).value
      : buffer.toString("utf-8");

  if (!text.trim()) throw new Error("無法從檔案中讀取到文字內容");
  return { type: "input_text", text: `合約檔名：${fileName}\n\n合約內容：\n${text}` };
}

export async function analyzeContract(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ContractAnalysis> {
  const contractInput = await buildContractInput(buffer, fileName, mimeType);

  const response = await getClient().responses.create({
    model: AI_MODEL,
    instructions: SYSTEM_PROMPT,
    input: [
      {
        role: "user",
        content: [contractInput, { type: "input_text", text: "請審查這份合約。" }],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "contract_analysis",
        strict: true,
        schema: analysisJsonSchema,
      },
    },
  });

  if (!response.output_text) throw new Error("AI 沒有回傳任何結果");
  return JSON.parse(response.output_text) as ContractAnalysis;
}
