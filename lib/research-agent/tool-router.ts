import type { RoutingDecision, StopContext, TaskType, ToolName } from "./types";

const ROUTES: Record<TaskType, ToolName[]> = {
  technical_research: ["internal_documents", "notebooklm", "web_search"],
  market_research: ["external_apis", "notebooklm", "web_search"],
  fact_verification: ["external_apis", "web_search", "notebooklm"],
  signal_detection: ["web_search", "notebooklm"],
  source_validation: ["external_apis", "web_search"],
  data_lookup: ["internal_documents", "external_apis", "web_search"],
};

export const STOPPING_CRITERIA = {
  confidenceThreshold: 0.85,
  minMarginalGain: 0.05,
  maxToolCalls: 12,
};

export function routeTools(taskType: TaskType): RoutingDecision {
  return {
    taskType,
    orderedTools: ROUTES[taskType],
  };
}

export function shouldStop(context: StopContext): boolean {
  return (
    context.confidenceScore >= STOPPING_CRITERIA.confidenceThreshold ||
    context.marginalGain < STOPPING_CRITERIA.minMarginalGain ||
    context.toolCalls >= STOPPING_CRITERIA.maxToolCalls
  );
}
