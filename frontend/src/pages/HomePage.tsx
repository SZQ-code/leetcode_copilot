import { Link } from "react-router-dom";

const workflow = [
  ["01", "读懂题目", "提取约束、输入输出和边界条件。"],
  ["02", "形成思路", "解释算法选择、关键步骤和复杂度。"],
  ["03", "沉淀复盘", "保存记录，按标签归纳薄弱题型。"],
];

export function HomePage() {
  return (
    <main>
      <section className="page-shell grid gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
        <div>
          <p className="eyebrow">ALGORITHM LEARNING WORKBENCH</p>
          <h1 className="page-title mt-5">
            不只解出一道题，
            <span className="text-cobalt">还要学会一类题。</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate">
            LeetCode Copilot 将题目理解、解法生成、代码解释、刷题记录与题型复盘放进同一个学习闭环。
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link className="button-primary inline-flex" to="/solve">
              输入一道题
            </Link>
            <Link className="button-secondary inline-flex" to="/history">
              查看刷题记录
            </Link>
          </div>
        </div>

        <aside className="panel self-end" aria-label="项目状态">
          <div className="border-b border-line bg-ink px-5 py-4 text-white">
            <span className="font-mono text-xs tracking-[0.14em]">BUILD STATUS</span>
          </div>
          <dl className="divide-y divide-line">
            {[
              ["Frontend", "READY"],
              ["FastAPI", "HEALTHY"],
              ["AI solver", "NEXT STAGE"],
              ["SQLite", "NEXT STAGE"],
            ].map(([label, value]) => (
              <div className="flex justify-between gap-6 px-5 py-4" key={label}>
                <dt className="text-sm text-slate">{label}</dt>
                <dd className="font-mono text-xs font-semibold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="page-shell py-14">
          <p className="eyebrow">LEARNING LOOP</p>
          <h2 className="section-title mt-3">一次提交，三步形成学习资产</h2>
          <div className="mt-8 grid gap-px border border-line bg-line md:grid-cols-3">
            {workflow.map(([number, title, description]) => (
              <article className="bg-surface p-6" key={number}>
                <span className="font-mono text-sm font-bold text-code">{number}</span>
                <h3 className="mt-8 text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

