import { ProblemInput } from "../components/ProblemInput";
import { SolutionPanel } from "../components/SolutionPanel";

export function SolvePage() {
  return (
    <main className="page-shell py-12 sm:py-16">
      <p className="eyebrow">SOLVE / INPUT</p>
      <h1 className="page-title mt-4">把题目放进学习闭环</h1>
      <p className="mt-5 max-w-2xl leading-7 text-slate">
        当前页面展示输入与结果区域的基础结构。解题接口和 mock AI 解析将在下一阶段接入。
      </p>
      <div className="mt-10 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <ProblemInput disabled />
        <SolutionPanel />
      </div>
    </main>
  );
}

