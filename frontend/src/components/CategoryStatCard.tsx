import type { CategoryStats } from "../types/problem";
import { TagBadge } from "./TagBadge";

interface CategoryStatCardProps {
  category: CategoryStats;
  isSelected: boolean;
  onSelect: () => void;
}

export function CategoryStatCard({
  category,
  isSelected,
  onSelect,
}: CategoryStatCardProps) {
  return (
    <button
      aria-pressed={isSelected}
      className={[
        "w-full rounded-lg border p-5 text-left transition-[border-color,background-color,transform] duration-200 active:translate-y-px",
        isSelected
          ? "border-cobalt bg-mist"
          : "border-line bg-surface hover:border-slate/60 hover:bg-raised",
      ].join(" ")}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-center justify-between gap-4">
        <TagBadge label={category.tag} tone="accent" />
        <span className="font-mono text-[0.65rem] text-slate">
          {category.total_count} PROBLEMS
        </span>
      </div>

      <div className="mt-7 flex items-end justify-between gap-5">
        <div>
          <p className="font-mono text-3xl font-bold text-ink">
            {category.mastery_rate.toFixed(1)}
            <span className="ml-1 text-sm text-slate">%</span>
          </p>
          <p className="mt-1 text-xs text-slate">掌握率</p>
        </div>
        <p className="text-right text-sm font-semibold text-warning">
          {category.review_count} 道待复习
        </p>
      </div>

      <div
        aria-label={`${category.tag}掌握率 ${category.mastery_rate.toFixed(1)}%`}
        className="mt-5 h-1.5 overflow-hidden rounded-full bg-line"
      >
        <div
          className="h-full rounded-full bg-cobalt transition-[width] duration-200"
          style={{ width: `${category.mastery_rate}%` }}
        />
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center">
        {[
          ["未掌握", category.unmastered_count, "text-warning"],
          ["学习中", category.learning_count, "text-cobalt"],
          ["已掌握", category.mastered_count, "text-success"],
        ].map(([label, value, color]) => (
          <div key={label}>
            <dt className="text-[0.68rem] text-slate">{label}</dt>
            <dd className={`mt-1 font-mono text-sm font-bold ${color}`}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </button>
  );
}
