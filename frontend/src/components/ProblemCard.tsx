import { Link } from "react-router-dom";

import { TagBadge } from "./TagBadge";

interface ProblemCardProps {
  createdAt?: string;
  difficulty: "简单" | "中等" | "困难";
  id: number | string;
  status: string;
  tags: string[];
  title: string;
}

const difficultyStyles = {
  困难: "border-danger/35 bg-danger/[0.08] text-danger",
  中等: "border-warning/35 bg-warning/[0.08] text-warning",
  简单: "border-success/35 bg-success/[0.08] text-success",
};

const statusStyles: Record<string, string> = {
  已掌握: "border-success/35 text-success",
  学习中: "border-cobalt/35 text-cobalt",
  未掌握: "border-warning/35 text-warning",
};

export function ProblemCard({
  createdAt,
  id,
  title,
  difficulty,
  tags,
  status,
}: ProblemCardProps) {
  return (
    <article className="panel group overflow-hidden transition-[border-color,background-color] duration-200 hover:border-slate/55 hover:bg-raised">
      <div className="grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.68rem] text-cobalt">#{id}</span>
            <span
              className={`rounded-full border px-2.5 py-1 font-mono text-[0.65rem] font-semibold ${difficultyStyles[difficulty]}`}
            >
              {difficulty}
            </span>
            <span
              className={`rounded-full border bg-shell px-2.5 py-1 font-mono text-[0.65rem] font-semibold ${
                statusStyles[status] ?? "border-line text-slate"
              }`}
            >
              {status}
            </span>
          </div>
          <h2 className="mt-3 truncate text-lg font-bold text-ink transition-colors group-hover:text-cobalt">
            {title}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagBadge key={tag} label={tag} />
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between gap-5 sm:min-w-36 sm:flex-col sm:items-end">
          {createdAt ? (
            <time
              className="font-mono text-[0.65rem] leading-5 text-slate"
              dateTime={createdAt}
            >
              {new Intl.DateTimeFormat("zh-CN", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(createdAt))}
            </time>
          ) : (
            <span />
          )}
          <Link
            aria-label={`查看${title}详情`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cobalt hover:text-cobalt-dark"
            to={`/problems/${id}`}
          >
            打开记录
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
