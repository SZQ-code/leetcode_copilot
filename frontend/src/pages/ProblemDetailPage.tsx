import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  confirmAgentToolCall,
  getAgentConversation,
  getProblem,
  sendAgentMessage,
  updateProblem,
} from "../api/problems";
import { InterfaceState } from "../components/InterfaceState";
import { LearningRecordPanel } from "../components/LearningRecordPanel";
import { OriginalProblemPanel } from "../components/OriginalProblemPanel";
import { SolutionPanel } from "../components/SolutionPanel";
import { TagBadge } from "../components/TagBadge";
import { TutorAgentPanel } from "../components/TutorAgentPanel";
import type { AgentConversation } from "../types/agent";
import type {
  MasteryStatus,
  ProblemDetail,
} from "../types/problem";

export function ProblemDetailPage() {
  const { problemId } = useParams();
  const numericProblemId = Number(problemId);
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [masteryStatus, setMasteryStatus] =
    useState<MasteryStatus>("未掌握");
  const [personalNotes, setPersonalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [agentConversation, setAgentConversation] =
    useState<AgentConversation | null>(null);
  const [isAgentLoading, setIsAgentLoading] = useState(true);
  const [isAgentSending, setIsAgentSending] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [confirmingToolCallId, setConfirmingToolCallId] =
    useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<"solution" | "agent">(
    "solution",
  );

  useEffect(() => {
    let isActive = true;

    async function loadProblem() {
      if (!Number.isInteger(numericProblemId) || numericProblemId <= 0) {
        setLoadError("题目 ID 无效。");
        setIsLoading(false);
        return;
      }

      try {
        const detail = await getProblem(numericProblemId);
        if (isActive) {
          setProblem(detail);
          setMasteryStatus(detail.mastery_status);
          setPersonalNotes(detail.personal_notes);
        }

        try {
          const conversation = await getAgentConversation(numericProblemId);
          if (isActive) {
            setAgentConversation(conversation);
          }
        } catch (error) {
          if (isActive) {
            setAgentError(
              error instanceof Error
                ? error.message
                : "无法加载题目导师会话。",
            );
          }
        }
      } catch (error) {
        if (isActive) {
          setLoadError(
            error instanceof Error ? error.message : "无法加载题目详情。",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
          setIsAgentLoading(false);
        }
      }
    }

    void loadProblem();

    return () => {
      isActive = false;
    };
  }, [numericProblemId]);

  async function handleSave() {
    if (!problem) {
      return;
    }

    setSaveState("saving");
    setSaveError(null);

    try {
      const updated = await updateProblem(problem.problem_id, {
        mastery_status: masteryStatus,
        personal_notes: personalNotes,
      });
      setProblem(updated);
      setMasteryStatus(updated.mastery_status);
      setPersonalNotes(updated.personal_notes);
      setAgentConversation((current) =>
        current
          ? {
              ...current,
              mastery_status: updated.mastery_status,
              personal_notes: updated.personal_notes,
            }
          : current,
      );
      setSaveState("saved");
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "无法保存学习记录。",
      );
      setSaveState("error");
    }
  }

  function syncAgentRecord(conversation: AgentConversation) {
    setAgentConversation(conversation);
    setMasteryStatus(conversation.mastery_status);
    setPersonalNotes(conversation.personal_notes);
    setProblem((current) =>
      current
        ? {
            ...current,
            mastery_status: conversation.mastery_status,
            personal_notes: conversation.personal_notes,
          }
        : current,
    );
  }

  async function handleAgentSend(content: string) {
    if (!problem) {
      return;
    }

    setIsAgentSending(true);
    setAgentError(null);
    setMobileTab("agent");

    try {
      const conversation = await sendAgentMessage(
        problem.problem_id,
        content,
      );
      syncAgentRecord(conversation);
    } catch (error) {
      setAgentError(
        error instanceof Error
          ? error.message
          : "题目导师暂时无法回复。",
      );
    } finally {
      setIsAgentSending(false);
    }
  }

  async function handleAgentConfirm(toolCallId: number) {
    if (!problem) {
      return;
    }

    setConfirmingToolCallId(toolCallId);
    setAgentError(null);
    try {
      const conversation = await confirmAgentToolCall(
        problem.problem_id,
        toolCallId,
      );
      syncAgentRecord(conversation);
    } catch (error) {
      setAgentError(
        error instanceof Error
          ? error.message
          : "无法确认这项学习记录更新。",
      );
    } finally {
      setConfirmingToolCallId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="page-shell">
        <InterfaceState
          description="正在读取题目、学习记录和 Tutor Agent 会话。"
          label="RECORD / LOADING"
          title="正在打开学习记录"
          tone="loading"
        />
      </main>
    );
  }

  if (loadError || !problem) {
    return (
      <main className="page-shell">
        <InterfaceState
          action={
            <Link className="button-secondary inline-flex" to="/history">
              返回刷题记录
            </Link>
          }
          description={loadError ?? "这条学习记录不存在或已被删除。"}
          label="RECORD / NOT_FOUND"
          title="无法打开这条记录"
          tone="error"
        />
      </main>
    );
  }

  return (
    <main className="page-shell">
      <Link
        className="inline-flex items-center gap-2 font-mono text-[0.68rem] font-semibold text-cobalt hover:text-cobalt-dark"
        to="/history"
      >
        <span aria-hidden="true">←</span>
        返回刷题记录
      </Link>

      <header className="mt-6 grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="status-chip">RECORD / #{problem.problem_id}</span>
            <span className="status-chip border-code/35 text-code">
              {problem.difficulty}
            </span>
            <span className="status-chip">{masteryStatus}</span>
          </div>
          <h1 className="page-title mt-5 break-words">{problem.title}</h1>
        </div>
        <div className="flex max-w-md flex-wrap gap-2 lg:justify-end">
          {problem.tags.map((tag) => (
            <TagBadge key={tag} label={tag} tone="accent" />
          ))}
        </div>
      </header>

      <div
        aria-label="详情内容"
        className="sticky top-15 z-20 mt-6 grid grid-cols-2 rounded-md border border-line bg-shell p-1 lg:hidden"
        role="tablist"
      >
        <button
          aria-selected={mobileTab === "solution"}
          className={
            mobileTab === "solution"
              ? "rounded bg-cobalt px-4 py-3 text-sm font-bold text-[#071017]"
              : "rounded px-4 py-3 text-sm font-semibold text-slate"
          }
          onClick={() => setMobileTab("solution")}
          role="tab"
          type="button"
        >
          题解
        </button>
        <button
          aria-selected={mobileTab === "agent"}
          className={
            mobileTab === "agent"
              ? "rounded bg-cobalt px-4 py-3 text-sm font-bold text-[#071017]"
              : "rounded px-4 py-3 text-sm font-semibold text-slate"
          }
          onClick={() => setMobileTab("agent")}
          role="tab"
          type="button"
        >
          题目导师
        </button>
      </div>

      <div className="mt-6 grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.78fr)]">
        <div
          className={
            mobileTab === "solution"
              ? "min-w-0 space-y-6"
              : "hidden min-w-0 space-y-6 lg:block"
          }
          role="tabpanel"
        >
          <div className="grid min-w-0 items-start gap-6 2xl:grid-cols-2">
            <OriginalProblemPanel
              content={problem.original_content}
              problemId={problem.problem_id}
            />
            <LearningRecordPanel
              masteryStatus={masteryStatus}
              notes={personalNotes}
              onMasteryStatusChange={(status) => {
                setMasteryStatus(status);
                setSaveState("idle");
              }}
              onNotesChange={(notes) => {
                setPersonalNotes(notes);
                setSaveState("idle");
              }}
              onSave={() => void handleSave()}
              saveError={saveError}
              saveState={saveState}
            />
          </div>
          <SolutionPanel
            solution={problem}
            status="success"
            title="已保存的题目解析"
          />
        </div>

        <aside
          className={
            mobileTab === "agent"
              ? "min-w-0 lg:sticky lg:top-20"
              : "hidden min-w-0 lg:sticky lg:top-20 lg:block"
          }
          role="tabpanel"
        >
          <TutorAgentPanel
            confirmingToolCallId={confirmingToolCallId}
            conversation={agentConversation}
            errorMessage={agentError}
            isLoading={isAgentLoading}
            isSending={isAgentSending}
            onConfirm={(toolCallId) =>
              void handleAgentConfirm(toolCallId)
            }
            onSend={(content) => void handleAgentSend(content)}
          />
        </aside>
      </div>
    </main>
  );
}
