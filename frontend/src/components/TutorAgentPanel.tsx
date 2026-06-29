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
  strength: "掌握点",
  review_focus: "复习重点",
};

const memoryStyles: Record<LearningMemoryType, string> = {
  misconception: "border-code/40 bg-orange-50 text-code",
  strength: "border-emerald-600/40 bg-emerald-50 text-emerald-800",
  review_focus: "border-cobalt/40 bg-mist text-cobalt-dark",
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
    const grouped = new Map<number, NonNullable<typeof conversation>["tool_calls"]>();
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
    <section className="panel flex h-[calc(100vh-7rem)] min-h-[36rem] flex-col">
      <header className="border-b border-line px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">TUTOR / AGENT</p>
            <h2 className="mt-1 text-xl font-bold">题目导师</h2>
          </div>
          <span className="font-mono text-xs text-emerald-700">
            ● TOOL READY
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {memories.length > 0 ? (
            memories.slice(-6).map((memory) => (
              <span
                className={`border px-2 py-1 text-xs ${memoryStyles[memory.memory_type]}`}
                key={memory.id}
                title={memory.content}
              >
                {memoryLabels[memory.memory_type]}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate">
              对话中形成的误区和复习重点会保存在这里。
            </span>
          )}
        </div>
      </header>

      <div
        aria-live="polite"
        className="flex-1 space-y-4 overflow-y-auto px-4 py-5"
      >
        {isLoading ? (
          <p className="text-sm text-slate">正在加载导师会话…</p>
        ) : messages.length === 0 ? (
          <div>
            <p className="text-sm leading-7 text-slate">
              围绕当前题目追问。Agent 会读取题目上下文，并按需要调用历史、
              学习画像和记忆工具。
            </p>
            <div className="mt-5 grid gap-2">
              {quickActions.map((action) => (
                <button
                  className="border border-line bg-paper px-3 py-2 text-left text-sm text-ink hover:border-cobalt hover:text-cobalt"
                  disabled={isSending}
                  key={action}
                  onClick={() => submitMessage(action)}
                  type="button"
                >
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
                      ? "ml-8 bg-ink p-3 text-sm leading-6 whitespace-pre-wrap text-white"
                      : "mr-5 border border-cobalt/30 bg-mist p-3 text-sm leading-6 whitespace-pre-wrap text-ink"
                  }
                >
                  <p className="mb-1 font-mono text-[10px] font-semibold tracking-wider opacity-65">
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
          <div className="mr-5 border border-cobalt/30 bg-mist p-3 text-sm text-slate">
            <p className="font-mono text-[10px] font-semibold tracking-wider text-cobalt">
              AGENT LOOP
            </p>
            <p className="mt-2">正在思考并按需调用学习工具…</p>
          </div>
        ) : null}
        {errorMessage ? (
          <div className="border-l-4 border-code bg-orange-50 p-3 text-sm text-code" role="alert">
            {errorMessage}
          </div>
        ) : null}
      </div>

      <form
        className="border-t border-line bg-paper p-4"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs font-semibold" htmlFor="agent-message">
            继续追问
          </label>
          <span className="font-mono text-[10px] text-slate">
            {draft.length} / 4000
          </span>
        </div>
        <textarea
          className="mt-2 min-h-24 w-full resize-y border border-line bg-surface px-3 py-2 text-sm leading-6 outline-none placeholder:text-slate/60"
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
