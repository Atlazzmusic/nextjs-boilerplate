export type TaskType =
  | "data_lookup"
  | "market_research"
  | "technical_research"
  | "signal_detection"
  | "source_validation"
  | "fact_verification";

export type SourceType = "primary" | "secondary" | "news" | "other";

export type FindingType = "fact" | "validated_insight" | "signal" | "assumption";

export type ConfidenceLevel = "high" | "medium" | "low";

export type ToolName =
  | "internal_documents"
  | "notebooklm"
  | "web_search"
  | "external_apis";

export interface SourceEvidence {
  citationUrl: string;
  snippetRef: string;
  retrievedAt: string;
}

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  credibility: ConfidenceLevel;
  independent: boolean;
  provider: ToolName;
  evidence?: SourceEvidence;
}

export interface Finding {
  type: FindingType;
  statement: string;
  sourceIds: string[];
  confidence: ConfidenceLevel;
}

export interface RoutingDecision {
  taskType: TaskType;
  orderedTools: ToolName[];
}

export interface StopContext {
  confidenceScore: number;
  marginalGain: number;
  toolCalls: number;
}

export interface VerificationResult {
  promotedType: FindingType;
  confidence: ConfidenceLevel;
  reasons: string[];
}
