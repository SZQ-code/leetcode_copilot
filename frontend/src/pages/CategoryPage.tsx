import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getCategories, getProblems } from "../api/problems";
import { CategoryStatCard } from "../components/CategoryStatCard";
import { LearningOverview } from "../components/LearningOverview";
import { ProblemCard } from "../components/ProblemCard";
import type {
  CategoryOverview,
  ProblemListItem,
} from "../types/problem";

export function CategoryPage() {
  const [overview, setOverview] = useState<CategoryOverview | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [problemsError, setProblemsError] = useState<string | null>(null);
  const [areProblemsLoading, setAreProblemsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"review" | "all">("review");

  useEffect(() => {
    let isActive = true;

    async function loadOverview() {
      try {
        const result = await getCategories();
        if (isActive) {
          setOverview(result);
        }
      } catch (error) {
        if (isActive) {
          setOverviewError(
            error instanceof Error ? error.message : "无法加载题型统计。",
          );
        }
      } finally {
        if (isActive) {
          setIsOverviewLoading(false);
        }
      }
    }

    void loadOverview();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadProblems() {
      setAreProblemsLoading(true);
      setProblemsError(null);

      try {
        const result = await getProblems({
          tag: selectedTag,
          reviewOnly: viewMode === "review",
        });
        if (isActive) {
          setProblems(result);
        }
      } catch (error) {
        if (isActive) {
          setProblemsError(
            error instanceof Error ? error.message : "无法加载复习题目。",
          );
        }
      } finally {
        if (isActive) {
          setAreProblemsLoading(false);
        }
      }
    }

    void loadProblems();
    return () => {
      isActive = false;
    };
  }, [selectedTag, viewMode]);

  return (
    <main className="page-shell py-12 sm:py-16">
      <p className="eyebrow">CATEGORIES / PATTERNS</p>
      <h1 className="page-title mt-4">按题型归纳方法</h1>
      <p className="mt-5 max-w-2xl leading-7 text-slate">
        从真实刷题记录中识别薄弱题型，把下一次复习放在最需要的位置。
      </p>

      {isOverviewLoading ? (
        <section className="panel mt-10 p-8">
          <p className="font-mono text-xs font-semibold tracking-[0.14em] text-cobalt">
            ANALYZING LEARNING RECORDS
          </p>
          <p className="mt-3 text-sm text-slate">正在计算题型掌握情况。</p>
        </section>
      ) : overviewError || !overview ? (
        <section className="panel mt-10 border-l-4 border-l-code p-6" role="alert">
          <h2 className="font-bold">无法加载题型统计</h2>
          <p className="mt-2 text-sm text-slate">{overviewError}</p>
        </section>
      ) : overview.total_problems === 0 ? (
        <section className="panel mt-10 p-8">
          <p className="eyebrow">NO LEARNING DATA</p>
          <h2 className="section-title mt-3">先完成一道题</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate">
            保存第一条解题记录后，这里会自动生成掌握率和题型分布。
          </p>
          <Link className="button-primary mt-6 inline-flex" to="/solve">
            开始解题
          </Link>
        </section>
      ) : (
        <>
          <div className="mt-10">
            <LearningOverview overview={overview} />
          </div>

          <section className="mt-14">
            <div>
              <p className="eyebrow">WEAKNESS MAP</p>
              <h2 className="section-title mt-3">题型掌握分布</h2>
              <p className="mt-3 text-sm text-slate">
                点击题型筛选下方题目；再次点击可恢复全部标签。
              </p>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {overview.categories.map((category) => (
                <CategoryStatCard
                  category={category}
                  isSelected={selectedTag === category.tag}
                  key={category.tag}
                  onSelect={() =>
                    setSelectedTag((current) =>
                      current === category.tag ? null : category.tag,
                    )
                  }
                />
              ))}
            </div>
          </section>

          <section className="mt-14">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">REVIEW QUEUE</p>
                <h2 className="section-title mt-3">
                  {selectedTag ?? "全部标签"} ·{" "}
                  {viewMode === "review" ? "待复习" : "全部记录"}
                </h2>
              </div>
              <div className="flex w-fit border border-line bg-surface p-1">
                {[
                  ["review", "待复习"],
                  ["all", "全部记录"],
                ].map(([mode, label]) => (
                  <button
                    aria-pressed={viewMode === mode}
                    className={[
                      "px-4 py-2 text-sm font-semibold transition-colors",
                      viewMode === mode
                        ? "bg-ink text-white"
                        : "text-slate hover:text-ink",
                    ].join(" ")}
                    key={mode}
                    onClick={() => setViewMode(mode as "review" | "all")}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {areProblemsLoading ? (
              <div className="panel mt-7 p-6">
                <p className="font-mono text-xs text-cobalt">
                  LOADING REVIEW QUEUE
                </p>
              </div>
            ) : problemsError ? (
              <div className="panel mt-7 border-l-4 border-l-code p-6" role="alert">
                <h3 className="font-bold">无法加载题目列表</h3>
                <p className="mt-2 text-sm text-slate">{problemsError}</p>
              </div>
            ) : problems.length === 0 ? (
              <div className="panel mt-7 p-6">
                <p className="text-sm text-slate">
                  {viewMode === "review"
                    ? "该范围内没有待复习题目。"
                    : "该范围内还没有刷题记录。"}
                </p>
              </div>
            ) : (
              <div className="mt-7 grid gap-5 lg:grid-cols-2">
                {problems.map((problem) => (
                  <ProblemCard
                    createdAt={problem.created_at}
                    difficulty={problem.difficulty}
                    id={problem.problem_id}
                    key={problem.problem_id}
                    status={problem.mastery_status}
                    tags={problem.tags}
                    title={problem.title}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
