import type { CategoryOverview } from "../types/problem";

interface LearningOverviewProps {
  overview: CategoryOverview;
}

export function LearningOverview({ overview }: LearningOverviewProps) {
  const stats = [
    ["总题数", overview.total_problems],
    ["已掌握", overview.mastered_problems],
    ["待复习", overview.review_problems],
  ];

  return (
    <section className="panel grid overflow-hidden lg:grid-cols-[0.72fr_1.28fr]">
      <div className="bg-ink p-7 text-white">
        <p className="font-mono text-xs tracking-[0.14em] text-white/65">
          OVERALL MASTERY
        </p>
        <p className="mt-8 font-display text-6xl font-bold tracking-[-0.04em]">
          {overview.mastery_rate.toFixed(1)}
          <span className="ml-1 text-2xl text-white/60">%</span>
        </p>
        <p className="mt-3 text-sm leading-6 text-white/65">
          已掌握题目占全部学习记录的比例
        </p>
      </div>
      <dl className="grid gap-px bg-line sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <div className="bg-surface p-6" key={label}>
            <dt className="text-sm text-slate">{label}</dt>
            <dd className="mt-8 font-mono text-3xl font-bold text-ink">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
