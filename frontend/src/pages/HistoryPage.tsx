import { ProblemCard } from "../components/ProblemCard";

const sampleProblem = {
  id: "0001",
  title: "两数之和（界面示例）",
  difficulty: "简单" as const,
  tags: ["数组", "哈希表"],
  status: "未评估",
};

export function HistoryPage() {
  return (
    <main className="page-shell py-12 sm:py-16">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">HISTORY / REVIEW</p>
          <h1 className="page-title mt-4">刷题记录</h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-slate">
          当前卡片为界面示例。接入 SQLite 后，这里将展示实际解题记录和掌握状态。
        </p>
      </div>
      <div className="mt-10 max-w-3xl">
        <ProblemCard {...sampleProblem} />
      </div>
    </main>
  );
}

