import { useState } from "react";
import { Link } from "react-router-dom";

import { solveProblem } from "../api/problems";
import { ProblemInput } from "../components/ProblemInput";
import {
  SolutionPanel,
  type SolutionStatus,
} from "../components/SolutionPanel";
import type { ProblemDetail } from "../types/problem";

export function SolvePage() {
  const [status, setStatus] = useState<SolutionStatus>("idle");
  const [solution, setSolution] = useState<ProblemDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(problemText: string) {
    const content = problemText.trim();

    if (content.length < 10) {
      setSolution(null);
      setErrorMessage("题目文本至少需要 10 个有效字符。");
      setStatus("error");
      return;
    }

    setSolution(null);
    setErrorMessage(null);
    setStatus("loading");

    try {
      const result = await solveProblem(content);
      setSolution(result);
      setStatus("success");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "请求失败，请稍后重试。",
      );
      setStatus("error");
    }
  }

  return (
    <main className="page-shell">
      <header className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">SOLVE / NEW SESSION</p>
          <h1 className="page-title mt-5">把题目放进学习闭环</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate">
            粘贴算法题文本，生成题目总结、解题思路、Python
            实现、复杂度分析和复盘建议。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="status-chip">
            <span className="size-1.5 rounded-full bg-success" />
            SOLVER READY
          </span>
          <span className="status-chip">AUTO SAVE</span>
        </div>
      </header>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(23rem,0.88fr)_minmax(0,1.12fr)]">
        <div className="space-y-4 xl:sticky xl:top-20">
          <ProblemInput
            isSubmitting={status === "loading"}
            onSubmit={handleSubmit}
          />
          {solution ? (
            <div
              className="rounded-lg border border-success/45 bg-success/8 p-4 text-sm text-ink"
              role="status"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1 size-2 shrink-0 rounded-full bg-success"
                />
                <p>
                  已保存为学习记录 #{solution.problem_id}。
                  <Link
                    className="ml-2 font-semibold text-cobalt hover:text-cobalt-dark"
                    to={`/problems/${solution.problem_id}`}
                  >
                    打开详情 →
                  </Link>
                </p>
              </div>
            </div>
          ) : null}
        </div>
        <SolutionPanel
          errorMessage={errorMessage}
          solution={solution}
          status={status}
        />
      </div>
    </main>
  );
}
