import { FormEvent, useMemo, useState } from "react";

import type {
  AgentConversation,
  LearningMemoryType,
} from "../types/agent";
import { AgentToolTrace } from "./AgentToolTrace";

interface TutorAgentPanelProps {
  confirmingToolCallId: number | null;
  conversation: AgentConversation | null;
  errorMessage: string | null;
  isLoading: boolean;
  isSending: boolean;
  onConfirm: (toolCallId: number) => void;
  onSend: (content: string) => void;
}

const memoryLabels: Record<LearningMemoryType, string> = {
  misconception: "误区",
  review_focus: "复习重点",
  strength: "掌握点",
};

const memoryStyles: Record<LearningMemoryType, string> = {
  misconception: "border-danger/35 bg-danger/[0.08] text-danger",
  review_focus: "border-cobalt/35 bg-mist text-cobalt",
  strength: "border-success/35 bg-success/[0.08] text-success",
};

const quickActions = [
  "先给我一个不直接暴露答案的分级提示。",
  "解释这道题核心代码为什么这样写。",
  "帮我找几道历史相似题进行对比。",
  "根据这次对话总结后续复习重点。",
];

export function TutorAgentPanel({
  confirmingToolCallId,
  conversation,
  errorMessage,
  isLoading,
  isSending,
  onConfirm,
  onSend,
}: TutorAgentPanelProps) {
  const [draft, setDraft] = useState("");
  const memories = conversation?.memories ?? [];
  const messages = conversation?.messages ?? [];
  const toolCallsByMessage = useMemo(() => {
    const grouped = new Map<
      number,
      NonNullable<typeof conversation>["tool_calls"]
    >();
    for (const toolCall of conversation?.tool_calls ?? []) {
      const group = grouped.get(toolCall.trigger_message_id) ?? [];
      group.push(toolCall);
      grouped.set(toolCall.trigger_message_id, group);
    }
    return grouped;
  }, [conversation]);

  function submitMessage(content: string) {
    const normalized = content.trim();
    if (!normalized || isSending) {
      return;
    }
    onSend(normalized);
    setDraft("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage(draft);
  }

  return (
    <section className="panel flex min-h-[34rem] flex-col overflow-hidden lg:h-[calc(100vh-6.5rem)]">
      <header className="border-b border-line bg-shell px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">TUTOR / AGENT</p>
            <h2 className="mt-1 text-xl font-bold">题目导师</h2>
          </div>
          <span className="status-chip border-success/30 text-success">
            <span className="size-1.5 rounded-full bg-success" />
            TOOL READY
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {memories.length > 0 ? (
            memories.slice(-6).map((memory) => (
              <span
                className={`rounded-full border px-2.5 py-1 text-[0.68rem] ${memoryStyles[memory.memory_type]}`}
                key={memory.id}
                title={memory.content}
              >
                {memoryLabels[memory.memory_type]}
              </span>
            ))
          ) : (
            <span className="text-xs leading-5 text-slate">
              对话形成的误区、掌握点和复习重点会保存在这里。
            </span>
          )}
        </div>
      </header>

      <div
        aria-live="polite"
        className="flex-1 space-y-4 overflow-y-auto bg-paper/35 px-4 py-5"
      >
        {isLoading ? (
          <div className="flex items-center gap-3 text-sm text-slate">
            <span className="status-pulse size-2 rounded-full bg-cobalt" />
            正在加载导师会话…
          </div>
        ) : messages.length === 0 ? (
          <div>
            <p className="text-sm leading-7 text-slate">
              围绕当前题目继续追问。Agent
              会按需读取题目上下文、相似历史和学习画像。
            </p>
            <div className="mt-5 grid gap-2">
              {quickActions.map((action) => (
                <button
                  className="rounded-md border border-line bg-shell px-3 py-2.5 text-left text-sm leading-6 text-slate transition-colors hover:border-cobalt/55 hover:bg-mist hover:text-ink"
                  disabled={isSending}
                  key={action}
                  onClick={() => submitMessage(action)}
                  type="button"
                >
                  <span className="mr-2 font-mono text-cobalt">›</span>
                  {action}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const relatedToolCalls =
              message.role === "user"
                ? toolCallsByMessage.get(message.id) ?? []
                : [];
            return (
              <div className="space-y-2" key={message.id}>
                <div
                  className={
                    message.role === "user"
                      ? "ml-8 rounded-md border border-cobalt/25 bg-mist p-3 text-sm leading-6 whitespace-pre-wrap text-ink"
                      : "mr-5 rounded-md border border-line bg-surface p-3 text-sm leading-6 whitespace-pre-wrap text-ink"
                  }
                >
                  <p
                    className={`mb-1 font-mono text-[0.62rem] font-semibold tracking-[0.1em] ${
                      message.role === "user" ? "text-cobalt" : "text-success"
                    }`}
                  >
                    {message.role === "user" ? "YOU" : "TUTOR AGENT"}
                  </p>
                  {message.content}
                </div>
                <AgentToolTrace
                  confirmingToolCallId={confirmingToolCallId}
                  onConfirm={onConfirm}
                  toolCalls={relatedToolCalls}
                />
              </div>
            );
          })
        )}

        {isSending ? (
          <div className="mr-5 rounded-md border border-cobalt/30 bg-mist p-3 text-sm text-slate">
            <p className="font-mono text-[0.62rem] font-semibold tracking-[0.1em] text-cobalt">
              AGENT LOOP / RUNNING
            </p>
            <p className="mt-2">正在思考并按需调用学习工具…</p>
          </div>
        ) : null}
        {errorMessage ? (
          <div
            className="rounded-md border border-danger/40 bg-danger/[0.08] p-3 text-sm leading-6 text-danger"
            role="alert"
          >
            {errorMessage}
          </div>
        ) : null}
      </div>

      <form
        className="border-t border-line bg-shell p-4"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs font-semibold" htmlFor="agent-message">
            继续追问
          </label>
          <span className="font-mono text-[0.62rem] text-slate">
            {draft.length} / 4000
          </span>
        </div>
        <textarea
          className="field-control mt-2 min-h-24 w-full resize-y leading-6"
          disabled={isLoading || isSending}
          id="agent-message"
          maxLength={4000}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="追问、粘贴代码，或要求更新学习状态…"
          value={draft}
        />
        <button
          className="button-primary mt-3 inline-flex w-full"
          disabled={isLoading || isSending || !draft.trim()}
          type="submit"
        >
          {isSending ? "Agent 运行中…" : "发送给题目导师"}
        </button>
      </form>
    </section>
  );
}
