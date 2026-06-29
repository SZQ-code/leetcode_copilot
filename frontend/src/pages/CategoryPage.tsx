import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getCategories, getProblems } from "../api/problems";
import { CategoryStatCard } from "../components/CategoryStatCard";
import { InterfaceState } from "../components/InterfaceState";
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
    <main className="page-shell">
      <header className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">PATTERNS / REVIEW SYSTEM</p>
          <h1 className="page-title mt-5">题型归纳</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate">
            从真实刷题记录中识别薄弱题型，把下一次复习放在最需要的位置。
          </p>
        </div>
        <Link className="button-primary inline-flex w-fit" to="/solve">
          继续解题
        </Link>
      </header>

      {isOverviewLoading ? (
        <div className="mt-8">
          <InterfaceState
            description="正在计算总体掌握率、题型分布和复习队列。"
            label="ANALYTICS / LOADING"
            title="正在分析学习记录"
            tone="loading"
          />
        </div>
      ) : overviewError || !overview ? (
        <div className="mt-8">
          <InterfaceState
            description={overviewError ?? "题型统计未返回有效数据。"}
            label="ANALYTICS / ERROR"
            title="无法加载题型统计"
            tone="error"
          />
        </div>
      ) : overview.total_problems === 0 ? (
        <div className="mt-8">
          <InterfaceState
            action={
              <Link className="button-primary inline-flex" to="/solve">
                开始第一道题
              </Link>
            }
            description="保存第一条解题记录后，这里会自动生成掌握率和题型分布。"
            label="ANALYTICS / EMPTY"
            title="还没有可分析的学习数据"
          />
        </div>
      ) : (
        <>
          <div className="mt-8">
            <LearningOverview overview={overview} />
          </div>

          <section className="mt-14">
            <div className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">WEAKNESS / MAP</p>
                <h2 className="section-title mt-3">题型掌握分布</h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-slate">
                点击题型筛选复习队列；再次点击可恢复全部标签。
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
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
            <div className="flex flex-col gap-5 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">REVIEW / QUEUE</p>
                <h2 className="section-title mt-3">
                  {selectedTag ?? "全部标签"}
                  <span className="mx-2 text-slate">/</span>
                  {viewMode === "review" ? "待复习" : "全部记录"}
                </h2>
              </div>
              <div
                aria-label="复习队列显示范围"
                className="flex w-fit rounded-md border border-line bg-shell p-1"
                role="group"
              >
                {[
                  ["review", "待复习"],
                  ["all", "全部记录"],
                ].map(([mode, label]) => (
                  <button
                    aria-pressed={viewMode === mode}
                    className={[
                      "rounded px-4 py-2 text-sm font-semibold transition-colors",
                      viewMode === mode
                        ? "bg-cobalt text-[#071017]"
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
              <div className="mt-6">
                <InterfaceState
                  description="正在读取当前范围内的学习记录。"
                  label="QUEUE / LOADING"
                  title="正在加载复习队列"
                  tone="loading"
                />
              </div>
            ) : problemsError ? (
              <div className="mt-6">
                <InterfaceState
                  description={problemsError}
                  label="QUEUE / ERROR"
                  title="无法加载复习队列"
                  tone="error"
                />
              </div>
            ) : problems.length === 0 ? (
              <div className="mt-6">
                <InterfaceState
                  description={
                    viewMode === "review"
                      ? "该范围内没有待复习题目，可以切换到全部记录。"
                      : "该范围内还没有刷题记录。"
                  }
                  label="QUEUE / EMPTY"
                  title="当前队列为空"
                />
              </div>
            ) : (
              <div className="mt-6 space-y-4">
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
