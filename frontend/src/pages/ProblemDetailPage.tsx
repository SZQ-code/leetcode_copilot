import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getProblem, updateProblem } from "../api/problems";
import { LearningRecordPanel } from "../components/LearningRecordPanel";
import { OriginalProblemPanel } from "../components/OriginalProblemPanel";
import { SolutionPanel } from "../components/SolutionPanel";
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
      } catch (error) {
        if (isActive) {
          setLoadError(
            error instanceof Error ? error.message : "无法加载题目详情。",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
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
      setSaveState("saved");
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "无法保存学习记录。",
      );
      setSaveState("error");
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

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
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

      <div className="mt-8">
        <SolutionPanel
          solution={problem}
          status="success"
          title="已保存的题目解析"
        />
      </div>
    </main>
  );
}
