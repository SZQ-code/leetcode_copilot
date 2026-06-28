import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getProblems } from "../api/problems";
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
    <main className="page-shell py-12 sm:py-16">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">HISTORY / REVIEW</p>
          <h1 className="page-title mt-4">刷题记录</h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-slate">
          每次成功生成解析都会保存为学习记录。最新提交显示在最前面。
        </p>
      </div>

      {isLoading ? (
        <section className="panel mt-10 p-8">
          <p className="font-mono text-xs font-semibold tracking-[0.14em] text-cobalt">
            LOADING HISTORY
          </p>
          <p className="mt-3 text-sm text-slate">正在读取 SQLite 学习记录。</p>
        </section>
      ) : errorMessage ? (
        <section className="panel mt-10 border-l-4 border-l-code p-6" role="alert">
          <h2 className="font-bold">无法加载刷题记录</h2>
          <p className="mt-2 text-sm text-slate">{errorMessage}</p>
        </section>
      ) : problems.length === 0 ? (
        <section className="panel mt-10 p-8">
          <p className="eyebrow">NO RECORDS YET</p>
          <h2 className="section-title mt-3">先完成第一道题</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate">
            提交题目并生成解析后，记录会自动出现在这里。
          </p>
          <Link className="button-primary mt-6 inline-flex" to="/solve">
            开始解题
          </Link>
        </section>
      ) : (
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
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
    </main>
  );
}
