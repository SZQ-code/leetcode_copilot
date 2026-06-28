import { NavLink } from "react-router-dom";

const navigation = [
  { label: "首页", to: "/" },
  { label: "开始解题", to: "/solve" },
  { label: "刷题记录", to: "/history" },
  { label: "题型归纳", to: "/categories" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
      <nav
        aria-label="主导航"
        className="page-shell flex min-h-16 flex-wrap items-center justify-between gap-3 py-3"
      >
        <NavLink className="flex items-center gap-3" to="/">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center bg-ink font-mono text-sm font-bold text-white"
          >
            LC
          </span>
          <span className="font-display text-lg font-bold tracking-[-0.02em] uppercase">
            LeetCode Copilot
          </span>
        </NavLink>

        <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                [
                  "px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-mist text-cobalt"
                    : "text-slate hover:text-ink",
                ].join(" ")
              }
              end={item.to === "/"}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}

