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
        "w-full border p-5 text-left transition-colors",
        isSelected
          ? "border-cobalt bg-mist"
          : "border-line bg-surface hover:border-cobalt/55",
      ].join(" ")}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-center justify-between gap-4">
        <TagBadge label={category.tag} tone="accent" />
        <span className="font-mono text-xs text-slate">
          {category.total_count} PROBLEMS
        </span>
      </div>

      <div className="mt-7 flex items-end justify-between gap-5">
        <div>
          <p className="font-mono text-3xl font-bold text-ink">
            {category.mastery_rate.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-slate">掌握率</p>
        </div>
        <p className="text-right text-sm text-code">
          {category.review_count} 道待复习
        </p>
      </div>

      <div
        aria-label={`${category.tag}掌握率 ${category.mastery_rate.toFixed(1)}%`}
        className="mt-5 h-1.5 bg-line"
      >
        <div
          className="h-full bg-cobalt"
          style={{ width: `${category.mastery_rate}%` }}
        />
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center">
        {[
          ["未掌握", category.unmastered_count],
          ["学习中", category.learning_count],
          ["已掌握", category.mastered_count],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-slate">{label}</dt>
            <dd className="mt-1 font-mono text-sm font-bold text-ink">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </button>
  );
}
