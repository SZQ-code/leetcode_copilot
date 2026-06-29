import type { MasteryStatus } from "./problem";

export type AgentRole = "user" | "assistant";
export type AgentToolStatus =
  | "succeeded"
  | "failed"
  | "pending_confirmation"
  | "confirmed";
export type LearningMemoryType =
  | "misconception"
  | "strength"
  | "review_focus";

export interface AgentMessage {
  id: number;
  role: AgentRole;
  content: string;
  sequence: number;
  created_at: string;
}

export interface AgentToolCall {
  id: number;
  trigger_message_id: number;
  tool_name: string;
  result_summary: string;
  status: AgentToolStatus;
  duration_ms: number;
  proposed_mastery_status: MasteryStatus | null;
  proposed_personal_notes: string | null;
  created_at: string;
  confirmed_at: string | null;
}

export interface LearningMemory {
  id: number;
  memory_type: LearningMemoryType;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface AgentConversation {
  problem_id: number;
  session_id: number | null;
  messages: AgentMessage[];
  tool_calls: AgentToolCall[];
  memories: LearningMemory[];
  mastery_status: MasteryStatus;
  personal_notes: string;
}
