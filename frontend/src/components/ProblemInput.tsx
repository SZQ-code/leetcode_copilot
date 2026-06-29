import { FormEvent, useState } from "react";

interface ProblemInputProps {
  disabled?: boolean;
  isSubmitting?: boolean;
  onSubmit?: (problemText: string) => void;
}

export function ProblemInput({
  disabled = false,
  isSubmitting = false,
  onSubmit,
}: ProblemInputProps) {
  const [problemText, setProblemText] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = problemText.trim();

    if (!disabled && !isSubmitting && value) {
      onSubmit?.(value);
    }
  }

  return (
    <form className="panel overflow-hidden" onSubmit={handleSubmit}>
      <header className="flex items-center justify-between gap-4 border-b border-line bg-shell px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-danger/65" />
            <span className="size-2 rounded-full bg-warning/65" />
            <span className="size-2 rounded-full bg-success/65" />
          </span>
          <label
            className="font-mono text-xs font-semibold text-ink"
            htmlFor="problem"
          >
            problem.txt
          </label>
        </div>
        <span className="font-mono text-[0.65rem] text-slate">
          {problemText.length} CHARS
        </span>
      </header>

      <div className="grid grid-cols-[2.75rem_1fr]">
        <div
          aria-hidden="true"
          className="select-none border-r border-line bg-paper px-3 py-5 text-right font-mono text-[0.68rem] leading-7 text-slate/45"
        >
          {Array.from({ length: 12 }, (_, index) => (
            <span className="block" key={index}>
              {String(index + 1).padStart(2, "0")}
            </span>
          ))}
        </div>
        <textarea
          className="min-h-80 w-full resize-y bg-surface px-5 py-4 font-mono text-sm leading-7 text-ink outline-none placeholder:text-slate/48 xl:min-h-[27rem]"
          id="problem"
          disabled={disabled || isSubmitting}
          onChange={(event) => setProblemText(event.target.value)}
          placeholder={"// 在这里粘贴算法题文本\n// 例如：给定一个整数数组 nums 和一个目标值 target……"}
          value={problemText}
        />
      </div>

      <footer className="border-t border-line bg-shell px-4 py-4">
        <div className="flex items-center gap-2 text-xs text-slate">
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${
              isSubmitting ? "status-pulse bg-warning" : "bg-success"
            }`}
          />
          <p>
            {isSubmitting
              ? "AI Solver 正在分析题目并生成学习资产。"
              : "按后端配置使用 DeepSeek 或 Mock Provider。"}
          </p>
        </div>
        <button
          className="button-primary mt-4 inline-flex w-full"
          disabled={disabled || isSubmitting || !problemText.trim()}
          type="submit"
        >
          {isSubmitting ? "正在生成解析…" : "生成题目解析"}
        </button>
      </footer>
    </form>
  );
}
