import type { ConfidenceLevel, Finding, Source, VerificationResult } from "./types";

function toConfidence(score: number): ConfidenceLevel {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}

export function verifyFinding(finding: Finding, sources: Source[]): VerificationResult {
  const supporting = sources.filter((source) => finding.sourceIds.includes(source.id));
  const primaryIndependentCount = supporting.filter(
    (source) => source.type === "primary" && source.independent,
  ).length;
  const hasNotebookLmOnly =
    supporting.length > 0 && supporting.every((source) => source.provider === "notebooklm");

  const scoreBase =
    supporting.length === 0
      ? 0
      : supporting.reduce((acc, source) => {
          const credibilityWeight =
            source.credibility === "high" ? 1 : source.credibility === "medium" ? 0.7 : 0.4;
          const typeWeight = source.type === "primary" ? 1 : source.type === "secondary" ? 0.7 : 0.4;
          return acc + credibilityWeight * typeWeight;
        }, 0) / supporting.length;

  const confidence = toConfidence(scoreBase);
  const reasons: string[] = [];

  if (hasNotebookLmOnly) {
    reasons.push("NotebookLM alene kan ikke gi high-confidence fact.");
    return {
      promotedType: finding.type === "fact" ? "validated_insight" : finding.type,
      confidence: confidence === "high" ? "medium" : confidence,
      reasons,
    };
  }

  if (finding.type === "fact" && primaryIndependentCount < 1) {
    reasons.push("Fact krever minst én uavhengig primærkilde.");
    return {
      promotedType: "validated_insight",
      confidence: confidence === "high" ? "medium" : confidence,
      reasons,
    };
  }

  return {
    promotedType: finding.type,
    confidence,
    reasons,
  };
}
