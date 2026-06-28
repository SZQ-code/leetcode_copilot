import { Link } from "react-router-dom";

import { TagBadge } from "./TagBadge";

interface ProblemCardProps {
  createdAt?: string;
  title: string;
  id: number | string;
  difficulty: "简单" | "中等" | "困难";
  tags: string[];
  status: string;
}

export function ProblemCard({
  createdAt,
  id,
  title,
  difficulty,
  tags,
  status,
}: ProblemCardProps) {
  return (
    <article className="panel p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-slate">#{id}</span>
            <span className="font-mono text-xs font-semibold text-code">
              {difficulty}
            </span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-ink">{title}</h2>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span className="w-fit border border-line px-3 py-1 font-mono text-xs text-slate">
            {status}
          </span>
          {createdAt ? (
            <time
              className="font-mono text-xs text-slate"
              dateTime={createdAt}
            >
              {new Intl.DateTimeFormat("zh-CN", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(createdAt))}
            </time>
          ) : null}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagBadge key={tag} label={tag} />
        ))}
      </div>
      <Link
        className="mt-6 inline-flex text-sm font-semibold text-cobalt hover:text-cobalt-dark"
        to={`/problems/${id}`}
      >
        查看题目详情 →
      </Link>
    </article>
  );
}
