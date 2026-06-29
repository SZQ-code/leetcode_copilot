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
    <section className="relative border-t border-line pt-7">
      <span
        aria-hidden="true"
        className="absolute -top-1 left-0 size-2 rounded-full border border-cobalt bg-surface"
      />
      <p className="font-mono text-[0.68rem] font-semibold tracking-[0.12em] text-code uppercase">
        {label}
      </p>
      <h3 className="mt-2 text-lg font-bold text-ink">{title}</h3>
      <div className="mt-3 text-sm leading-7 text-slate">{children}</div>
    </section>
  );
}

function SolutionContent({ solution }: { solution: ProblemSolution }) {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="status-chip border-code/35 text-code">
            {solution.difficulty}
          </span>
          <div className="flex flex-wrap gap-2">
            {solution.tags.map((tag) => (
              <TagBadge key={tag} label={tag} tone="accent" />
            ))}
          </div>
        </div>
        <h3 className="mt-5 font-display text-4xl font-bold tracking-[-0.035em] text-ink">
          {solution.title}
        </h3>
      </div>

      <TextSection label="01 / SUMMARY" title="题目总结">
        <p>{solution.problem_summary}</p>
      </TextSection>

      <div className="grid gap-8 lg:grid-cols-2">
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
            <li
              className="grid grid-cols-[2rem_1fr] gap-3 rounded-md border border-line bg-shell p-3"
              key={`${index}-${item}`}
            >
              <span className="font-mono text-xs font-bold text-cobalt">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </TextSection>

      <TextSection label="06 / COMPLEXITY" title="复杂度分析">
        <dl className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
          <div className="bg-shell p-5">
            <dt className="text-xs text-slate">时间复杂度</dt>
            <dd className="mt-3 font-mono text-xl font-bold text-cobalt">
              {solution.time_complexity}
            </dd>
          </div>
          <div className="bg-shell p-5">
            <dt className="text-xs text-slate">空间复杂度</dt>
            <dd className="mt-3 font-mono text-xl font-bold text-cobalt">
              {solution.space_complexity}
            </dd>
          </div>
        </dl>
      </TextSection>

      <div className="grid gap-8 lg:grid-cols-2">
        <TextSection label="07 / PITFALLS" title="常见错误">
          <ul className="space-y-3">
            {solution.common_mistakes.map((item) => (
              <li className="border-l-2 border-danger pl-3" key={item}>
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
        <p className="rounded-md border border-cobalt/35 bg-mist p-5 text-ink">
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
  const statusConfig = {
    idle: { color: "bg-cobalt", label: "AI_READY" },
    loading: { color: "status-pulse bg-warning", label: "PROCESSING" },
    success: { color: "bg-success", label: "AI_RESULT" },
    error: { color: "bg-danger", label: "REQUEST_FAILED" },
  }[status];

  return (
    <section aria-live="polite" className="panel overflow-hidden">
      <header className="panel-header bg-shell">
        <div>
          <p className="eyebrow">ANALYSIS / OUTPUT</p>
          <h2 className="mt-1 text-xl font-bold">{title}</h2>
        </div>
        <span className="status-chip">
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${statusConfig.color}`}
          />
          {statusConfig.label}
        </span>
      </header>
      <div className="p-5 sm:p-7">
        {children ? (
          children
        ) : status === "loading" ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <div className="relative size-14">
              <span className="absolute inset-0 rounded-full border border-cobalt/25" />
              <span className="status-pulse absolute inset-3 rounded-full border border-cobalt/60" />
              <span className="absolute inset-[1.45rem] rounded-full bg-cobalt" />
            </div>
            <p className="mt-6 font-mono text-xs font-semibold tracking-[0.14em] text-cobalt">
              ANALYZING PROBLEM
            </p>
            <p className="mt-3 text-sm text-slate">
              正在整理题意、解题思路、代码和复盘建议。
            </p>
          </div>
        ) : status === "error" ? (
          <div
            className="min-h-56 rounded-md border border-danger/45 bg-danger/6 p-6"
            role="alert"
          >
            <p className="eyebrow !text-danger">REQUEST / FAILED</p>
            <h3 className="mt-3 text-xl font-bold text-ink">未能生成解析</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate">
              {errorMessage ?? "请求失败，请检查服务后重试。"}
            </p>
          </div>
        ) : solution ? (
          <SolutionContent solution={solution} />
        ) : (
          <div className="flex min-h-64 flex-col justify-center">
            <p className="eyebrow">WAITING / INPUT</p>
            <h3 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em]">
              解析区已准备
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate">
              输入不少于 10
              个字符的题目文本并提交。这里将展示结构化解析、Python
              实现和学习建议。
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
