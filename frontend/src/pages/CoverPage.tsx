import {
  AnimationEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import "./CoverPage.css";

const EXIT_DURATION_MS = 800;
const REDUCED_EXIT_DURATION_MS = 80;

export function CoverPage() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<number | null>(null);
  const hasNavigatedRef = useRef(false);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  function finishEnteringWorkspace() {
    if (hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    navigate("/workspace");
  }

  function startEnteringWorkspace() {
    if (isExiting) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    setIsExiting(true);
    timerRef.current = window.setTimeout(
      finishEnteringWorkspace,
      prefersReducedMotion
        ? REDUCED_EXIT_DURATION_MS
        : EXIT_DURATION_MS,
    );
  }

  function handleExitAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (isExiting && event.target === event.currentTarget) {
      finishEnteringWorkspace();
    }
  }

  function handleEntryKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      startEnteringWorkspace();
    }
  }

  return (
    <main
      aria-label="LeetCode Copilot 欢迎页"
      className={[
        "cover-page",
        isExiting ? "cover-page--exiting" : "",
      ].join(" ")}
    >
      <div
        className="cover-page__scene"
        onAnimationEnd={handleExitAnimationEnd}
      >
        <span aria-hidden="true" className="cover-page__scan" />

        <div className="cover-page__content">
          <p className="cover-page__system">
            ALGORITHM LEARNING SYSTEM
          </p>
          <h1 className="cover-page__title">LEETCODE COPILOT</h1>
          <p className="cover-page__tagline">
            让每一道题，沉淀成可复用的方法。
          </p>
        </div>

        <p className="cover-page__prompt">
          <span aria-hidden="true" className="cover-page__prompt-line" />
          点击任意位置开始学习
          <span aria-hidden="true" className="cover-page__prompt-line" />
        </p>
      </div>

      <button
        aria-label="进入学习工作区"
        className="cover-page__trigger"
        disabled={isExiting}
        onClick={startEnteringWorkspace}
        onKeyDown={handleEntryKeyDown}
        type="button"
      >
        <span className="sr-only">进入学习工作区</span>
      </button>
    </main>
  );
}
