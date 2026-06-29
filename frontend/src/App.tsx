import { Link, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { CategoryPage } from "./pages/CategoryPage";
import { CoverPage } from "./pages/CoverPage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { ProblemDetailPage } from "./pages/ProblemDetailPage";
import { SolvePage } from "./pages/SolvePage";

function NotFoundPage() {
  return (
    <main className="page-shell flex min-h-[70vh] items-center">
      <section className="max-w-2xl">
        <p className="eyebrow">ROUTE / 404</p>
        <h1 className="page-title mt-5">这个页面不在工作区里。</h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-slate">
          地址可能已经变更。返回首页，继续解题或查看已有学习记录。
        </p>
        <Link className="button-primary mt-8 inline-flex" to="/workspace">
          返回学习工作区
        </Link>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CoverPage />} />
      <Route element={<AppShell />}>
        <Route path="/workspace" element={<HomePage />} />
        <Route path="/solve" element={<SolvePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/problems/:problemId" element={<ProblemDetailPage />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
