import { useState } from "react";

import { solveProblem } from "../api/problems";
import { ProblemInput } from "../components/ProblemInput";
import {
  SolutionPanel,
  type SolutionStatus,
} from "../components/SolutionPanel";
import type { ProblemSolution } from "../types/problem";

export function SolvePage() {
  const [status, setStatus] = useState<SolutionStatus>("idle");
  const [solution, setSolution] = useState<ProblemSolution | null>(null);
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
        粘贴题目并完成一次真实的前后端请求。当前返回固定的两数之和 Mock
        解析，用于验证完整学习流程。
      </p>
      <div className="mt-10 grid items-start gap-8 xl:grid-cols-[0.85fr_1.15fr]">
        <ProblemInput
          isSubmitting={status === "loading"}
          onSubmit={handleSubmit}
        />
        <SolutionPanel
          errorMessage={errorMessage}
          solution={solution}
          status={status}
        />
      </div>
    </main>
  );
}
