import { Schema, deleteModel, model, models, type InferSchemaType, type Model } from "mongoose";

const IssueSchema = new Schema(
  {
    clause: { type: String, required: true },
    riskLevel: { type: String, enum: ["low", "medium", "high"], required: true },
    problem: { type: String, required: true },
    suggestion: { type: String, required: true },
  },
  { _id: false }
);

const AnalysisSchema = new Schema(
  {
    contractType: { type: String, required: true },
    parties: { type: [String], default: [] },
    summary: { type: String, required: true },
    overallRisk: { type: String, enum: ["low", "medium", "high"], required: true },
    riskScore: { type: Number, min: 0, max: 100, required: true },
    issues: { type: [IssueSchema], default: [] },
    missingClauses: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
  },
  { _id: false }
);

const ContractReviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    blobUrl: { type: String, required: true },
    blobPathname: { type: String, required: true },
    aiModel: { type: String, required: true },
    analysis: { type: AnalysisSchema, required: true },
  },
  { timestamps: true }
);

export type ContractReviewDoc = InferSchemaType<typeof ContractReviewSchema>;

// 開發模式 hot reload 時重新註冊，確保 schema 修改會生效
if (process.env.NODE_ENV !== "production" && models.ContractReview) {
  deleteModel("ContractReview");
}

export const ContractReview: Model<ContractReviewDoc> =
  (models.ContractReview as Model<ContractReviewDoc>) || model<ContractReviewDoc>("ContractReview", ContractReviewSchema);
