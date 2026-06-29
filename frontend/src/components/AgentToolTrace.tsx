import type { AgentToolCall } from "../types/agent";

interface AgentToolTraceProps {
  confirmingToolCallId: number | null;
  onConfirm: (toolCallId: number) => void;
  toolCalls: AgentToolCall[];
}

const statusStyles = {
  succeeded: "border-cobalt bg-mist text-cobalt-dark",
  failed: "border-code bg-orange-50 text-code",
  pending_confirmation: "border-amber-500 bg-amber-50 text-amber-800",
  confirmed: "border-emerald-600 bg-emerald-50 text-emerald-800",
};

const statusLabels = {
  succeeded: "COMPLETED",
  failed: "FAILED",
  pending_confirmation: "CONFIRM",
  confirmed: "CONFIRMED",
};

export function AgentToolTrace({
  confirmingToolCallId,
  onConfirm,
  toolCalls,
}: AgentToolTraceProps) {
  if (toolCalls.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {toolCalls.map((toolCall) => (
        <details
          className={`border-l-4 px-3 py-2 text-xs ${statusStyles[toolCall.status]}`}
          key={toolCall.id}
          open={toolCall.status === "pending_confirmation"}
        >
          <summary className="cursor-pointer list-none font-mono font-semibold">
            TOOL · {toolCall.tool_name}
            <span className="ml-2 opacity-70">
              {statusLabels[toolCall.status]} · {toolCall.duration_ms}ms
            </span>
          </summary>
          <p className="mt-2 leading-5">{toolCall.result_summary}</p>

          {toolCall.proposed_mastery_status ? (
            <p className="mt-2 font-semibold">
              新掌握状态：{toolCall.proposed_mastery_status}
            </p>
          ) : null}
          {toolCall.proposed_personal_notes !== null ? (
            <p className="mt-2 line-clamp-3 whitespace-pre-wrap">
              新备注：{toolCall.proposed_personal_notes}
            </p>
          ) : null}

          {toolCall.status === "pending_confirmation" ? (
            <button
              className="mt-3 border border-current px-3 py-2 font-semibold disabled:opacity-50"
              disabled={confirmingToolCallId === toolCall.id}
              onClick={() => onConfirm(toolCall.id)}
              type="button"
            >
              {confirmingToolCallId === toolCall.id
                ? "正在确认…"
                : "确认执行"}
            </button>
          ) : null}
        </details>
      ))}
    </div>
  );
}
