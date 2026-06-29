import { ReactNode, useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";

import { getHealth } from "../api/problems";

type IconName = "home" | "solve" | "history" | "categories";
type ConnectionState = "checking" | "online" | "offline";

const navigation: Array<{
  description: string;
  icon: IconName;
  label: string;
  shortLabel: string;
  to: string;
}> = [
  {
    description: "学习工作区",
    icon: "home",
    label: "首页",
    shortLabel: "首页",
    to: "/workspace",
  },
  {
    description: "输入并解析题目",
    icon: "solve",
    label: "开始解题",
    shortLabel: "解题",
    to: "/solve",
  },
  {
    description: "回看学习记录",
    icon: "history",
    label: "刷题记录",
    shortLabel: "记录",
    to: "/history",
  },
  {
    description: "整理薄弱题型",
    icon: "categories",
    label: "题型归纳",
    shortLabel: "题型",
    to: "/categories",
  },
];

function WorkspaceIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    home: (
      <>
        <path d="M4 10.5 12 4l8 6.5" />
        <path d="M6.5 9.5V20h11V9.5M10 20v-6h4v6" />
      </>
    ),
    solve: (
      <>
        <path d="m8 6-5 6 5 6M16 6l5 6-5 6" />
        <path d="m14 4-4 16" />
      </>
    ),
    history: (
      <>
        <path d="M4 5v5h5" />
        <path d="M5.5 17.5A8 8 0 1 0 4 10" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    categories: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <path d="M14 17h6M17 14v6" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function getRouteContext(pathname: string) {
  if (pathname === "/workspace") {
    return { code: "WORKSPACE / HOME", title: "学习工作区" };
  }
  if (pathname === "/solve") {
    return { code: "WORKSPACE / SOLVE", title: "开始解题" };
  }
  if (pathname === "/history") {
    return { code: "WORKSPACE / HISTORY", title: "刷题记录" };
  }
  if (pathname === "/categories") {
    return { code: "WORKSPACE / PATTERNS", title: "题型归纳" };
  }
  if (pathname.startsWith("/problems/")) {
    const problemId = pathname.split("/").at(-1);
    return {
      code: `WORKSPACE / RECORD / #${problemId}`,
      title: "题目详情",
    };
  }
  return { code: "WORKSPACE / ROUTE_NOT_FOUND", title: "页面不存在" };
}

export function AppShell() {
  const location = useLocation();
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("checking");
  const routeContext = getRouteContext(location.pathname);

  useEffect(() => {
    let isActive = true;

    getHealth()
      .then(() => {
        if (isActive) {
          setConnectionState("online");
        }
      })
      .catch(() => {
        if (isActive) {
          setConnectionState("offline");
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const connectionLabel = {
    checking: "CONNECTING",
    online: "BACKEND ONLINE",
    offline: "BACKEND OFFLINE",
  }[connectionState];

  const connectionColor = {
    checking: "bg-warning",
    online: "bg-success",
    offline: "bg-danger",
  }[connectionState];

  return (
    <div className="min-h-screen bg-paper text-ink md:flex">
      <aside className="sticky top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-line bg-shell md:flex md:w-[4.5rem] lg:w-60">
        <Link
          aria-label="LeetCode Copilot 首页"
          className="flex h-18 items-center gap-3 border-b border-line px-4 lg:px-5"
          to="/workspace"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-cobalt font-mono text-xs font-black text-[#071017]">
            LC
          </span>
          <span className="hidden min-w-0 lg:block">
            <span className="block truncate font-display text-lg font-bold tracking-[-0.03em]">
              LEETCODE COPILOT
            </span>
            <span className="mt-0.5 block font-mono text-[0.58rem] tracking-[0.13em] text-slate">
              ALGORITHM WORKSPACE
            </span>
          </span>
        </Link>

        <nav aria-label="主导航" className="flex-1 space-y-1 px-2 py-5 lg:px-3">
          {navigation.map((item) => (
            <NavLink
              className={({ isActive }) =>
                [
                  "group relative flex min-h-12 items-center gap-3 rounded-md px-3 text-sm transition-colors duration-200",
                  isActive
                    ? "bg-mist text-cobalt"
                    : "text-slate hover:bg-raised hover:text-ink",
                ].join(" ")
              }
              end={item.to === "/workspace"}
              key={item.to}
              to={item.to}
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span
                      aria-hidden="true"
                      className="absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-cobalt"
                    />
                  ) : null}
                  <WorkspaceIcon name={item.icon} />
                  <span className="hidden min-w-0 lg:block">
                    <span className="block font-semibold">{item.label}</span>
                    <span className="mt-0.5 block truncate text-[0.68rem] text-slate">
                      {item.description}
                    </span>
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-md bg-paper/55 px-3 py-3">
            <span
              aria-hidden="true"
              className={`size-2 shrink-0 rounded-full ${connectionColor} ${
                connectionState === "checking" ? "status-pulse" : ""
              }`}
            />
            <span className="hidden font-mono text-[0.6rem] tracking-[0.08em] text-slate lg:block">
              {connectionLabel}
            </span>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 hidden h-14 items-center justify-between border-b border-line bg-paper/92 px-6 backdrop-blur md:flex xl:px-10">
          <div className="flex min-w-0 items-center gap-4">
            <span className="font-mono text-[0.65rem] font-semibold tracking-[0.12em] text-cobalt">
              {routeContext.code}
            </span>
            <span aria-hidden="true" className="h-4 w-px bg-line" />
            <span className="truncate text-sm font-semibold text-slate">
              {routeContext.title}
            </span>
          </div>
          <div className="status-chip" role="status">
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${connectionColor} ${
                connectionState === "checking" ? "status-pulse" : ""
              }`}
            />
            {connectionLabel}
          </div>
        </header>

        <header className="sticky top-0 z-40 flex h-15 items-center justify-between border-b border-line bg-shell/96 px-4 backdrop-blur md:hidden">
          <Link className="flex items-center gap-3" to="/workspace">
            <span className="grid size-8 place-items-center rounded-md bg-cobalt font-mono text-[0.65rem] font-black text-[#071017]">
              LC
            </span>
            <span>
              <span className="block font-display text-base font-bold tracking-[-0.02em]">
                LEETCODE COPILOT
              </span>
              <span className="block font-mono text-[0.55rem] tracking-[0.12em] text-slate">
                {routeContext.title}
              </span>
            </span>
          </Link>
          <span
            aria-label={connectionLabel}
            className={`size-2.5 rounded-full ${connectionColor} ${
              connectionState === "checking" ? "status-pulse" : ""
            }`}
            role="status"
          />
        </header>

        <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
          <Outlet />
        </div>
      </div>

      <nav
        aria-label="移动端主导航"
        className="fixed right-0 bottom-0 left-0 z-50 grid grid-cols-4 border-t border-line bg-shell/97 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {navigation.map((item) => (
          <NavLink
            className={({ isActive }) =>
              [
                "relative flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-md text-[0.68rem] font-semibold transition-colors",
                isActive ? "text-cobalt" : "text-slate",
              ].join(" ")
            }
            end={item.to === "/workspace"}
            key={item.to}
            to={item.to}
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 h-0.5 w-7 rounded-full bg-cobalt"
                  />
                ) : null}
                <WorkspaceIcon name={item.icon} />
                <span>{item.shortLabel}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
