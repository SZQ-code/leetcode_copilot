import { useParams } from "react-router-dom";

import { CodeBlock } from "../components/CodeBlock";
import { SolutionPanel } from "../components/SolutionPanel";
import { TagBadge } from "../components/TagBadge";

const exampleCode = `def two_sum(nums, target):
    seen = {}
    for index, value in enumerate(nums):
        complement = target - value
        if complement in seen:
            return [seen[complement], index]
        seen[value] = index
    return []`;

export function ProblemDetailPage() {
  const { problemId = "unknown" } = useParams();

  return (
    <main className="page-shell py-12 sm:py-16">
      <p className="eyebrow">PROBLEM / #{problemId}</p>
      <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <h1 className="page-title">题目详情示例</h1>
        <div className="flex flex-wrap gap-2">
          <TagBadge label="数组" tone="accent" />
          <TagBadge label="哈希表" />
        </div>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <SolutionPanel title="题目解析占位">
          <div className="space-y-5 text-sm leading-7 text-slate">
            <p>
              详情页路由已经就绪。后续将根据题目 ID 请求后端，展示完整解析、掌握状态和个人备注。
            </p>
            <div className="border-l-2 border-code pl-4">
              当前内容仅用于验证页面和组件结构，不代表已实现业务数据。
            </div>
          </div>
        </SolutionPanel>
        <CodeBlock code={exampleCode} />
      </div>
    </main>
  );
}

