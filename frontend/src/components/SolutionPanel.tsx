import { ReactNode } from "react";

import type { ProblemSolution } from "../types/problem";
import { CodeBlock } from "./CodeBlock";
import { TagBadge } from "./TagBadge";

export type SolutionStatus = "idle" | "loading" | "success" | "error";

interface SolutionPanelProps {
  children?: ReactNode;
  errorMessage?: string | null;
  solution?: ProblemSolution | null;
  status?: SolutionStatus;
  title?: string;
}

interface TextSectionProps {
  children: ReactNode;
  label: string;
  title: string;
}

function TextSection({ children, label, title }: TextSectionProps) {
  return (
    <section className="border-t border-line pt-6">
      <p className="font-mono text-xs font-semibold tracking-[0.12em] text-code uppercase">
        {label}
      </p>
      <h3 className="mt-2 text-lg font-bold">{title}</h3>
      <div className="mt-3 text-sm leading-7 text-slate">{children}</div>
    </section>
  );
}

function SolutionContent({ solution }: { solution: ProblemSolution }) {
  return (
    <div className="space-y-7">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs font-semibold text-code">
            {solution.difficulty}
          </span>
          <div className="flex flex-wrap gap-2">
            {solution.tags.map((tag) => (
              <TagBadge key={tag} label={tag} tone="accent" />
            ))}
          </div>
        </div>
        <h3 className="mt-4 font-display text-3xl font-bold tracking-[-0.02em] uppercase">
          {solution.title}
        </h3>
      </div>

      <TextSection label="01 / SUMMARY" title="题目总结">
        <p>{solution.problem_summary}</p>
      </TextSection>

      <div className="grid gap-7 lg:grid-cols-2">
        <TextSection label="02 / APPROACH" title="解题思路">
          <p>{solution.solution_approach}</p>
        </TextSection>
        <TextSection label="03 / WHY" title="算法选择原因">
          <p>{solution.algorithm_reason}</p>
        </TextSection>
      </div>

      <TextSection label="04 / CODE" title="Python 实现">
        <CodeBlock code={solution.python_code} />
      </TextSection>

      <TextSection label="05 / WALKTHROUGH" title="代码解释">
        <ol className="space-y-3">
          {solution.code_explanation.map((item, index) => (
            <li className="grid grid-cols-[2rem_1fr] gap-2" key={item}>
              <span className="font-mono text-xs font-bold text-cobalt">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </TextSection>

      <TextSection label="06 / COMPLEXITY" title="复杂度分析">
        <dl className="grid gap-px border border-line bg-line sm:grid-cols-2">
          <div className="bg-paper p-4">
            <dt className="text-xs text-slate">时间复杂度</dt>
            <dd className="mt-2 font-mono text-xl font-bold text-ink">
              {solution.time_complexity}
            </dd>
          </div>
          <div className="bg-paper p-4">
            <dt className="text-xs text-slate">空间复杂度</dt>
            <dd className="mt-2 font-mono text-xl font-bold text-ink">
              {solution.space_complexity}
            </dd>
          </div>
        </dl>
      </TextSection>

      <div className="grid gap-7 lg:grid-cols-2">
        <TextSection label="07 / PITFALLS" title="常见错误">
          <ul className="space-y-3">
            {solution.common_mistakes.map((item) => (
              <li className="border-l-2 border-code pl-3" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </TextSection>
        <TextSection label="08 / EDGES" title="边界情况">
          <ul className="space-y-3">
            {solution.edge_cases.map((item) => (
              <li className="border-l-2 border-cobalt pl-3" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </TextSection>
      </div>

      <TextSection label="09 / TEACHING" title="教学分析">
        <p className="border border-cobalt bg-mist p-5 text-ink">
          {solution.teaching_analysis}
        </p>
      </TextSection>
    </div>
  );
}

export function SolutionPanel({
  children,
  errorMessage,
  solution,
  status = "idle",
  title = "AI 解析",
}: SolutionPanelProps) {
  const statusLabel = {
    idle: "AI_READY",
    loading: "PROCESSING",
    success: "AI_RESULT",
    error: "REQUEST_FAILED",
  }[status];

  return (
    <section aria-live="polite" className="panel">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="eyebrow">ANALYSIS</p>
          <h2 className="mt-1 text-xl font-bold">{title}</h2>
        </div>
        <span className="font-mono text-xs text-slate">{statusLabel}</span>
      </header>
      <div className="p-5">
        {children ? (
          children
        ) : status === "loading" ? (
          <div className="py-10 text-center">
            <p className="font-mono text-xs font-semibold tracking-[0.14em] text-cobalt">
              ANALYZING PROBLEM
            </p>
            <p className="mt-3 text-sm text-slate">
              AI Solver 正在整理题意、思路和代码。
            </p>
          </div>
        ) : status === "error" ? (
          <div className="border-l-4 border-code bg-paper p-5" role="alert">
            <h3 className="font-bold text-ink">未能生成解析</h3>
            <p className="mt-2 text-sm leading-6 text-slate">
              {errorMessage ?? "请求失败，请检查服务后重试。"}
            </p>
          </div>
        ) : solution ? (
          <SolutionContent solution={solution} />
        ) : (
          <p className="max-w-2xl text-sm leading-7 text-slate">
            输入不少于 10 个字符的题目文本并提交。这里将展示结构化题目解析、
            Python 实现和学习建议。
          </p>
        )}
      </div>
    </section>
  );
}
