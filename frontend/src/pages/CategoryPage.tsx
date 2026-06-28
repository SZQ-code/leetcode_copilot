import { TagBadge } from "../components/TagBadge";

const categoryExamples = [
  { name: "数组", count: 0, description: "遍历、双指针、前缀和等基础模式" },
  { name: "哈希表", count: 0, description: "映射、计数和快速查找" },
  { name: "动态规划", count: 0, description: "状态定义、转移与空间优化" },
  { name: "图", count: 0, description: "搜索、最短路与拓扑关系" },
];

export function CategoryPage() {
  return (
    <main className="page-shell py-12 sm:py-16">
      <p className="eyebrow">CATEGORIES / PATTERNS</p>
      <h1 className="page-title mt-4">按题型归纳方法</h1>
      <p className="mt-5 max-w-2xl leading-7 text-slate">
        当前显示分类布局示例。后续将根据刷题记录自动聚合标签、题目数量和掌握情况。
      </p>
      <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2">
        {categoryExamples.map((category) => (
          <article className="bg-surface p-6" key={category.name}>
            <div className="flex items-center justify-between gap-4">
              <TagBadge label={category.name} tone="accent" />
              <span className="font-mono text-xs text-slate">
                {category.count} PROBLEMS
              </span>
            </div>
            <p className="mt-8 text-sm leading-6 text-slate">
              {category.description}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}

