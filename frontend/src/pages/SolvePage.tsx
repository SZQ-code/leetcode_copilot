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
    <main className="page-shell py-12 sm:py-16">
      <p className="eyebrow">SOLVE / INPUT</p>
      <h1 className="page-title mt-4">把题目放进学习闭环</h1>
      <p className="mt-5 max-w-2xl leading-7 text-slate">
        粘贴算法题文本，由 AI 生成题目总结、解题思路、Python
        实现、复杂度分析和复盘建议。
      </p>
      <div className="mt-10 grid items-start gap-8 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          <ProblemInput
            isSubmitting={status === "loading"}
            onSubmit={handleSubmit}
          />
          {solution ? (
            <div className="border border-cobalt bg-mist p-4 text-sm text-ink">
              已保存为学习记录 #{solution.problem_id}。
              <Link
                className="ml-2 font-semibold text-cobalt hover:text-cobalt-dark"
                to={`/problems/${solution.problem_id}`}
              >
                打开详情 →
              </Link>
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
