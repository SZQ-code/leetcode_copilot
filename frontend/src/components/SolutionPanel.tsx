import { ReactNode } from "react";

interface SolutionPanelProps {
  children?: ReactNode;
  title?: string;
}

export function SolutionPanel({
  children,
  title = "AI 解析",
}: SolutionPanelProps) {
  return (
    <section className="panel">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="eyebrow">ANALYSIS</p>
          <h2 className="mt-1 text-xl font-bold">{title}</h2>
        </div>
        <span className="font-mono text-xs text-slate">MOCK_PENDING</span>
      </header>
      <div className="p-5">
        {children ?? (
          <p className="max-w-2xl text-sm leading-7 text-slate">
            提交题目后，这里将展示题目总结、解题思路、代码、复杂度、常见错误、边界情况和教学分析。
          </p>
        )}
      </div>
    </section>
  );
}

