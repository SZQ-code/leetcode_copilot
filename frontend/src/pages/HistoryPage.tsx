import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getProblems } from "../api/problems";
import { InterfaceState } from "../components/InterfaceState";
import { ProblemCard } from "../components/ProblemCard";
import type { ProblemListItem } from "../types/problem";

export function HistoryPage() {
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadProblems() {
      try {
        const history = await getProblems();
        if (isActive) {
          setProblems(history);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error ? error.message : "无法加载刷题记录。",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadProblems();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="page-shell">
      <header className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">HISTORY / LEARNING LOG</p>
          <h1 className="page-title mt-5">刷题记录</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate">
            每次成功生成解析都会保存为学习资产。重新打开记录，继续复盘或向
            Tutor Agent 追问。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="status-chip">
            {isLoading ? "READING DATABASE" : `${problems.length} RECORDS`}
          </span>
          <Link className="button-primary inline-flex" to="/solve">
            新建解题
          </Link>
        </div>
      </header>

      <section className="mt-8">
        {isLoading ? (
          <InterfaceState
            description="正在从 SQLite 读取已保存的学习记录。"
            label="DATABASE / LOADING"
            title="正在加载刷题记录"
            tone="loading"
          />
        ) : errorMessage ? (
          <InterfaceState
            description={errorMessage}
            label="DATABASE / ERROR"
            title="无法加载刷题记录"
            tone="error"
          />
        ) : problems.length === 0 ? (
          <InterfaceState
            action={
              <Link className="button-primary inline-flex" to="/solve">
                开始第一道题
              </Link>
            }
            description="提交题目并生成解析后，记录会自动保存在这里。"
            label="HISTORY / EMPTY"
            title="还没有学习记录"
          />
        ) : (
          <div className="space-y-4">
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
    </main>
  );
}
