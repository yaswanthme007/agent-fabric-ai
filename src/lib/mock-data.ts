export const AGENT_NAMES = ["Atlas", "Hermes", "Nexus-7", "Orion", "Lyra", "Cassini", "Prometheus", "Vega", "Helios", "Andromeda"];

export type AgentType = "NLP" | "Vision" | "Data" | "Automation";

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  successRate: number;
  avgRuntime: string;
  lastRun: string;
  color: "primary" | "secondary" | "accent" | "warning";
}

export const AGENTS: Agent[] = [
  { id: "a1", name: "Atlas", type: "NLP", description: "Long-context document summarization with citation tracking.", successRate: 98, avgRuntime: "1.4s", lastRun: "2m ago", color: "primary" },
  { id: "a2", name: "Hermes", type: "Automation", description: "Multi-step web automation and form submission agent.", successRate: 94, avgRuntime: "3.1s", lastRun: "5m ago", color: "secondary" },
  { id: "a3", name: "Nexus-7", type: "NLP", description: "Conversational router with intent classification.", successRate: 99, avgRuntime: "0.8s", lastRun: "30s ago", color: "accent" },
  { id: "a4", name: "Orion", type: "Vision", description: "Vision-language model for OCR and scene understanding.", successRate: 96, avgRuntime: "2.2s", lastRun: "12m ago", color: "primary" },
  { id: "a5", name: "Lyra", type: "Data", description: "Structured data extraction from unstructured sources.", successRate: 92, avgRuntime: "1.9s", lastRun: "1h ago", color: "warning" },
  { id: "a6", name: "Cassini", type: "Vision", description: "Image generation and editing with style transfer.", successRate: 97, avgRuntime: "4.7s", lastRun: "3m ago", color: "secondary" },
  { id: "a7", name: "Prometheus", type: "Automation", description: "Background job orchestrator with retry logic.", successRate: 99, avgRuntime: "0.6s", lastRun: "45s ago", color: "accent" },
  { id: "a8", name: "Vega", type: "Data", description: "Real-time stream aggregation and anomaly detection.", successRate: 95, avgRuntime: "1.1s", lastRun: "8m ago", color: "primary" },
];

export type PipelineStatus = "Running" | "Paused" | "Error" | "Idle";

export interface Pipeline {
  id: string;
  name: string;
  status: PipelineStatus;
  lastRun: string;
  duration: string;
}

export const PIPELINES: Pipeline[] = [
  { id: "p1", name: "Lead Enrichment Flow", status: "Running", lastRun: "2m ago", duration: "1m 42s" },
  { id: "p2", name: "Content Summarizer", status: "Running", lastRun: "5m ago", duration: "24s" },
  { id: "p3", name: "Daily Report Generator", status: "Paused", lastRun: "4h ago", duration: "3m 12s" },
  { id: "p4", name: "Support Ticket Classifier", status: "Running", lastRun: "1m ago", duration: "8s" },
  { id: "p5", name: "Invoice OCR Pipeline", status: "Error", lastRun: "12m ago", duration: "—" },
  { id: "p6", name: "Sentiment Stream", status: "Idle", lastRun: "1d ago", duration: "0s" },
  { id: "p7", name: "Knowledge Base Sync", status: "Running", lastRun: "8s ago", duration: "1m 02s" },
];

export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";
export interface LogEntry { id: string; time: string; level: LogLevel; pipeline: string; message: string; }

export const LOGS: LogEntry[] = [
  { id: "l1", time: "14:02:31", level: "INFO", pipeline: "Lead Enrichment Flow", message: "Agent Atlas dispatched batch_id=8821" },
  { id: "l2", time: "14:02:33", level: "INFO", pipeline: "Lead Enrichment Flow", message: "→ scraped 24 records from source.crunchbase" },
  { id: "l3", time: "14:02:34", level: "DEBUG", pipeline: "Content Summarizer", message: "Hermes acquired execution lock" },
  { id: "l4", time: "14:02:35", level: "WARN", pipeline: "Invoice OCR Pipeline", message: "Confidence below threshold (0.71), retrying" },
  { id: "l5", time: "14:02:36", level: "INFO", pipeline: "Support Ticket Classifier", message: "Nexus-7 routed ticket #44291 → billing" },
  { id: "l6", time: "14:02:37", level: "ERROR", pipeline: "Invoice OCR Pipeline", message: "Orion timeout after 30s on document_id=DOC-9921" },
  { id: "l7", time: "14:02:38", level: "INFO", pipeline: "Knowledge Base Sync", message: "Vega indexed 412 documents (chunk 12/40)" },
  { id: "l8", time: "14:02:40", level: "INFO", pipeline: "Lead Enrichment Flow", message: "Pipeline completed in 1m 42s" },
  { id: "l9", time: "14:02:41", level: "DEBUG", pipeline: "Daily Report Generator", message: "Scheduled run paused by user @sarah" },
  { id: "l10", time: "14:02:43", level: "INFO", pipeline: "Sentiment Stream", message: "Lyra processed 1.2k tweets, sentiment_avg=+0.41" },
];

export const ACTIVITY_SERIES = [
  { day: "Mon", runs: 820, errors: 12 },
  { day: "Tue", runs: 1120, errors: 8 },
  { day: "Wed", runs: 980, errors: 14 },
  { day: "Thu", runs: 1380, errors: 6 },
  { day: "Fri", runs: 1560, errors: 9 },
  { day: "Sat", runs: 1020, errors: 4 },
  { day: "Sun", runs: 1482, errors: 3 },
];

export const STATUS_BREAKDOWN = [
  { name: "Running", value: 14 },
  { name: "Idle", value: 6 },
  { name: "Error", value: 3 },
];
