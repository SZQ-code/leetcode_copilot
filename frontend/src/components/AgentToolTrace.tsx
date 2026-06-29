import type { AgentToolCall } from "../types/agent";

interface AgentToolTraceProps {
  confirmingToolCallId: number | null;
  onConfirm: (toolCallId: number) => void;
  toolCalls: AgentToolCall[];
}

const statusStyles = {
  confirmed: "border-success/45 bg-success/[0.07] text-success",
  failed: "border-danger/45 bg-danger/[0.07] text-danger",
  pending_confirmation:
    "border-warning/45 bg-warning/[0.07] text-warning",
  succeeded: "border-cobalt/45 bg-mist text-cobalt",
};

const statusLabels = {
  confirmed: "CONFIRMED",
  failed: "FAILED",
  pending_confirmation: "CONFIRM",
  succeeded: "COMPLETED",
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
    <div className="relative space-y-2 pl-4 before:absolute before:top-2 before:bottom-2 before:left-0 before:w-px before:bg-line">
      {toolCalls.map((toolCall) => (
        <details
          className={`relative rounded-md border px-3 py-2 text-xs ${statusStyles[toolCall.status]} before:absolute before:top-4 before:-left-[1.18rem] before:size-2 before:rounded-full before:border before:border-current before:bg-surface`}
          key={toolCall.id}
          open={toolCall.status === "pending_confirmation"}
        >
          <summary className="cursor-pointer list-none font-mono font-semibold">
            TOOL · {toolCall.tool_name}
            <span className="ml-2 opacity-70">
              {statusLabels[toolCall.status]} · {toolCall.duration_ms}ms
            </span>
          </summary>
          <p className="mt-2 leading-5 text-slate">
            {toolCall.result_summary}
          </p>

          {toolCall.proposed_mastery_status ? (
            <p className="mt-2 font-semibold">
              新掌握状态：{toolCall.proposed_mastery_status}
            </p>
          ) : null}
          {toolCall.proposed_personal_notes !== null ? (
            <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-slate">
              新备注：{toolCall.proposed_personal_notes}
            </p>
          ) : null}

          {toolCall.status === "pending_confirmation" ? (
            <button
              className="mt-3 rounded border border-current px-3 py-2 font-semibold transition-colors hover:bg-warning hover:text-[#171006] disabled:opacity-50"
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
