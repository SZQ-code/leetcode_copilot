import type { CategoryOverview } from "../types/problem";

interface LearningOverviewProps {
  overview: CategoryOverview;
}

export function LearningOverview({ overview }: LearningOverviewProps) {
  const stats = [
    ["总题数", overview.total_problems, "ALL RECORDS"],
    ["已掌握", overview.mastered_problems, "MASTERED"],
    ["待复习", overview.review_problems, "REVIEW QUEUE"],
  ];

  return (
    <section className="panel grid overflow-hidden xl:grid-cols-[0.82fr_1.18fr]">
      <div className="relative overflow-hidden border-b border-line bg-mist p-7 xl:border-r xl:border-b-0">
        <span
          aria-hidden="true"
          className="absolute -right-16 -bottom-20 size-56 rounded-full border border-cobalt/10"
        />
        <p className="font-mono text-[0.68rem] tracking-[0.14em] text-cobalt">
          OVERALL MASTERY
        </p>
        <p className="mt-7 font-display text-6xl font-bold tracking-[-0.045em] text-ink">
          {overview.mastery_rate.toFixed(1)}
          <span className="ml-1 text-2xl text-slate">%</span>
        </p>
        <p className="mt-3 max-w-sm text-sm leading-6 text-slate">
          已掌握题目占全部学习记录的比例
        </p>
      </div>
      <dl className="grid gap-px bg-line sm:grid-cols-3">
        {stats.map(([label, value, code]) => (
          <div className="bg-surface p-6" key={label}>
            <dt className="font-mono text-[0.62rem] tracking-[0.1em] text-slate">
              {code}
            </dt>
            <dd className="mt-8 font-mono text-3xl font-bold text-ink">
              {value}
            </dd>
            <p className="mt-2 text-sm text-slate">{label}</p>
          </div>
        ))}
      </dl>
    </section>
  );
}
