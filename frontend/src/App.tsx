import { Link, Route, Routes } from "react-router-dom";

import { Navbar } from "./components/Navbar";
import { CategoryPage } from "./pages/CategoryPage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { ProblemDetailPage } from "./pages/ProblemDetailPage";
import { SolvePage } from "./pages/SolvePage";

function NotFoundPage() {
  return (
    <main className="page-shell flex min-h-[65vh] items-center">
      <section>
        <p className="eyebrow">404 / ROUTE_NOT_FOUND</p>
        <h1 className="page-title mt-4">这个页面不在题解里。</h1>
        <p className="mt-4 max-w-xl text-slate">
          检查地址，或返回首页继续构建你的算法学习路径。
        </p>
        <Link className="button-primary mt-8 inline-flex" to="/">
          返回首页
        </Link>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/solve" element={<SolvePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/problems/:problemId" element={<ProblemDetailPage />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <footer className="border-t border-line">
        <div className="page-shell flex flex-col gap-2 py-7 text-sm text-slate sm:flex-row sm:items-center sm:justify-between">
          <span>LeetCode Copilot</span>
          <span className="font-mono text-xs">AI_PROVIDER / READY</span>
        </div>
      </footer>
    </div>
  );
}
