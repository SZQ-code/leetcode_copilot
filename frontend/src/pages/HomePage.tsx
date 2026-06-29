import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getCategories, getProblems } from "../api/problems";
import type {
  CategoryOverview,
  ProblemListItem,
} from "../types/problem";

type RequestState = "loading" | "success" | "error";

const workflow = [
  {
    code: "INPUT",
    description: "提取约束、输入输出和边界条件。",
    label: "读懂题目",
  },
  {
    code: "SOLVE",
    description: "生成思路、代码和复杂度分析。",
    label: "形成方法",
  },
  {
    code: "REVIEW",
    description: "保存记录并进入题型复习队列。",
    label: "沉淀复盘",
  },
];

export function HomePage() {
  const [recentProblems, setRecentProblems] = useState<ProblemListItem[]>([]);
  const [overview, setOverview] = useState<CategoryOverview | null>(null);
  const [problemsState, setProblemsState] =
    useState<RequestState>("loading");
  const [overviewState, setOverviewState] =
    useState<RequestState>("loading");

  useEffect(() => {
    let isActive = true;

    getProblems()
      .then((problems) => {
        if (isActive) {
          setRecentProblems(problems.slice(0, 3));
          setProblemsState("success");
        }
      })
      .catch(() => {
        if (isActive) {
          setProblemsState("error");
        }
      });

    getCategories()
      .then((result) => {
        if (isActive) {
          setOverview(result);
          setOverviewState("success");
        }
      })
      .catch(() => {
        if (isActive) {
          setOverviewState("error");
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const reviewCategories = useMemo(
    () =>
      [...(overview?.categories ?? [])]
        .sort((left, right) => right.review_count - left.review_count)
        .slice(0, 3),
    [overview],
  );

  return (
    <main>
      <section className="workspace-grid border-b border-line">
        <div className="page-shell grid min-h-[42rem] items-center gap-12 py-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] lg:py-20">
          <div>
            <div className="flex items-center gap-3">
              <span className="status-chip">
                <span className="size-1.5 rounded-full bg-success" />
                AI LEARNING WORKSPACE
              </span>
            </div>
            <h1 className="page-title mt-7">
              每道题，
              <span className="block text-cobalt">都留下可复用的方法。</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-slate sm:text-lg">
              从题意拆解、AI 解析到 Tutor Agent
              追问，把一次解题整理成下一次能调用的学习资产。
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link className="button-primary inline-flex" to="/solve">
                开始一道题
                <span aria-hidden="true" className="ml-2">→</span>
              </Link>
              <Link className="button-secondary inline-flex" to="/categories">
                查看复习队列
              </Link>
            </div>
            <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
              {[
                ["学习记录", overview?.total_problems ?? "—"],
                ["已掌握", overview?.mastered_problems ?? "—"],
                ["待复习", overview?.review_problems ?? "—"],
              ].map(([label, value]) => (
                <div className="bg-shell/90 p-4 sm:p-5" key={label}>
                  <dt className="text-xs text-slate">{label}</dt>
                  <dd className="mt-2 font-mono text-xl font-bold text-ink sm:text-2xl">
                    {overviewState === "loading" ? "···" : value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <aside className="panel-raised overflow-hidden" aria-label="学习执行流程">
            <header className="flex items-center justify-between border-b border-line bg-shell px-5 py-4">
              <div className="flex items-center gap-2" aria-hidden="true">
                <span className="size-2 rounded-full bg-danger/70" />
                <span className="size-2 rounded-full bg-warning/70" />
                <span className="size-2 rounded-full bg-success/70" />
              </div>
              <span className="font-mono text-[0.65rem] tracking-[0.1em] text-slate">
                LEARNING_PIPELINE
              </span>
            </header>
            <div className="p-5 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">SESSION / READY</p>
                  <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em]">
                    一次提交，形成学习闭环
                  </h2>
                </div>
                <span className="hidden font-mono text-xs text-success sm:block">
                  ● ONLINE
                </span>
              </div>

              <ol className="relative mt-8 space-y-2 before:absolute before:top-6 before:bottom-6 before:left-[1.12rem] before:w-px before:bg-line">
                {workflow.map((item, index) => (
                  <li
                    className="relative grid grid-cols-[2.25rem_1fr] gap-4 rounded-md border border-transparent p-3 transition-colors hover:border-line hover:bg-shell"
                    key={item.code}
                  >
                    <span className="z-10 grid size-9 place-items-center rounded-full border border-cobalt/45 bg-mist font-mono text-[0.65rem] font-bold text-cobalt">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="font-mono text-[0.62rem] tracking-[0.12em] text-code">
                        {item.code}
                      </span>
                      <strong className="mt-1 block text-sm text-ink">
                        {item.label}
                      </strong>
                      <span className="mt-1 block text-xs leading-5 text-slate">
                        {item.description}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>

      <section className="page-shell">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
          <section className="panel overflow-hidden">
            <header className="panel-header">
              <div>
                <p className="eyebrow">RECENT / RECORDS</p>
                <h2 className="mt-1 text-xl font-bold">最近学习记录</h2>
              </div>
              <Link className="button-ghost inline-flex" to="/history">
                查看全部
              </Link>
            </header>

            <div className="divide-y divide-line">
              {problemsState === "loading" ? (
                <div className="p-6 text-sm text-slate">正在读取最近记录…</div>
              ) : problemsState === "error" ? (
                <div className="p-6" role="alert">
                  <p className="font-semibold text-danger">最近记录暂时不可用</p>
                  <p className="mt-2 text-sm text-slate">
                    请确认后端服务已启动。解题入口仍然可以使用。
                  </p>
                </div>
              ) : recentProblems.length === 0 ? (
                <div className="p-6 sm:p-8">
                  <p className="eyebrow">NO RECORDS</p>
                  <h3 className="mt-3 text-xl font-bold">从第一道题开始</h3>
                  <p className="mt-2 text-sm leading-6 text-slate">
                    生成解析后，学习记录会自动出现在这里。
                  </p>
                  <Link className="button-primary mt-5 inline-flex" to="/solve">
                    输入题目
                  </Link>
                </div>
              ) : (
                recentProblems.map((problem) => (
                  <Link
                    className="group grid gap-4 p-5 transition-colors hover:bg-raised sm:grid-cols-[1fr_auto] sm:items-center"
                    key={problem.problem_id}
                    to={`/problems/${problem.problem_id}`}
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2 font-mono text-[0.65rem]">
                        <span className="text-cobalt">#{problem.problem_id}</span>
                        <span className="text-code">{problem.difficulty}</span>
                        <span className="text-slate">
                          {problem.tags.slice(0, 2).join(" / ")}
                        </span>
                      </span>
                      <strong className="mt-2 block truncate text-base text-ink group-hover:text-cobalt">
                        {problem.title}
                      </strong>
                    </span>
                    <span className="flex items-center gap-4">
                      <span className="status-chip">{problem.mastery_status}</span>
                      <span aria-hidden="true" className="text-cobalt">→</span>
                    </span>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="panel overflow-hidden">
            <header className="panel-header">
              <div>
                <p className="eyebrow">REVIEW / FOCUS</p>
                <h2 className="mt-1 text-xl font-bold">下一步复习</h2>
              </div>
              {overview ? (
                <span className="font-mono text-xs text-warning">
                  {overview.review_problems} QUEUED
                </span>
              ) : null}
            </header>
            <div className="p-5">
              {overviewState === "loading" ? (
                <p className="text-sm text-slate">正在分析学习记录…</p>
              ) : overviewState === "error" ? (
                <div role="alert">
                  <p className="font-semibold text-danger">题型统计暂时不可用</p>
                  <p className="mt-2 text-sm leading-6 text-slate">
                    连接后端后会自动显示薄弱题型。
                  </p>
                </div>
              ) : reviewCategories.length === 0 ? (
                <div>
                  <p className="text-sm leading-7 text-slate">
                    完成几道题后，这里会按待复习数量排列题型。
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviewCategories.map((category) => (
                    <div
                      className="rounded-md border border-line bg-shell p-4"
                      key={category.tag}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <strong className="text-sm">{category.tag}</strong>
                        <span className="font-mono text-xs text-warning">
                          {category.review_count} 待复习
                        </span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full rounded-full bg-cobalt"
                          style={{ width: `${category.mastery_rate}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate">
                        当前掌握率 {category.mastery_rate.toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <Link className="button-secondary mt-5 inline-flex w-full" to="/categories">
                打开题型归纳
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
