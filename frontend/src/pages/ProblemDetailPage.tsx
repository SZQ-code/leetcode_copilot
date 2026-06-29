import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  confirmAgentToolCall,
  getAgentConversation,
  getProblem,
  sendAgentMessage,
  updateProblem,
} from "../api/problems";
import { LearningRecordPanel } from "../components/LearningRecordPanel";
import { OriginalProblemPanel } from "../components/OriginalProblemPanel";
import { SolutionPanel } from "../components/SolutionPanel";
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
          const conversation = await getAgentConversation(
            numericProblemId,
          );
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
      <main className="page-shell min-h-[65vh] py-16">
        <p className="eyebrow">LOADING / PROBLEM</p>
        <h1 className="page-title mt-4">正在读取学习记录</h1>
      </main>
    );
  }

  if (loadError || !problem) {
    return (
      <main className="page-shell min-h-[65vh] py-16">
        <p className="eyebrow">PROBLEM / NOT_FOUND</p>
        <h1 className="page-title mt-4">无法打开这条记录</h1>
        <p className="mt-5 text-slate">{loadError}</p>
        <Link className="button-secondary mt-8 inline-flex" to="/history">
          返回刷题记录
        </Link>
      </main>
    );
  }

  return (
    <main className="page-shell py-12 sm:py-16">
      <Link
        className="font-mono text-xs font-semibold text-cobalt hover:text-cobalt-dark"
        to="/history"
      >
        ← 返回刷题记录
      </Link>
      <div className="mt-5">
        <p className="eyebrow">PROBLEM / #{problem.problem_id}</p>
        <h1 className="page-title mt-4">{problem.title}</h1>
      </div>

      <div className="mt-8 grid grid-cols-2 border border-ink lg:hidden">
        <button
          className={
            mobileTab === "solution"
              ? "bg-ink px-4 py-3 text-sm font-semibold text-white"
              : "px-4 py-3 text-sm font-semibold text-ink"
          }
          onClick={() => setMobileTab("solution")}
          type="button"
        >
          题解
        </button>
        <button
          className={
            mobileTab === "agent"
              ? "bg-ink px-4 py-3 text-sm font-semibold text-white"
              : "px-4 py-3 text-sm font-semibold text-ink"
          }
          onClick={() => setMobileTab("agent")}
          type="button"
        >
          题目导师
        </button>
      </div>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.86fr)]">
        <div
          className={
            mobileTab === "solution"
              ? "space-y-8"
              : "hidden space-y-8 lg:block"
          }
        >
          <div className="grid items-start gap-8 xl:grid-cols-2">
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
              ? "lg:sticky lg:top-6"
              : "hidden lg:sticky lg:top-6 lg:block"
          }
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
