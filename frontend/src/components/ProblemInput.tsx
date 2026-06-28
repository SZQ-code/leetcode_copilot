import { FormEvent, useState } from "react";

interface ProblemInputProps {
  disabled?: boolean;
  onSubmit?: (problemText: string) => void;
}

export function ProblemInput({
  disabled = false,
  onSubmit,
}: ProblemInputProps) {
  const [problemText, setProblemText] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = problemText.trim();

    if (!disabled && value) {
      onSubmit?.(value);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <label className="font-mono text-xs font-semibold text-ink" htmlFor="problem">
          problem.txt
        </label>
        <span className="font-mono text-xs text-slate">
          {problemText.length} chars
        </span>
      </div>
      <div className="grid grid-cols-[3rem_1fr]">
        <div
          aria-hidden="true"
          className="select-none border-r border-line bg-paper px-3 py-5 text-right font-mono text-xs leading-7 text-slate/55"
        >
          01
          <br />
          02
          <br />
          03
          <br />
          04
          <br />
          05
          <br />
          06
        </div>
        <textarea
          className="min-h-52 w-full resize-y bg-surface px-5 py-4 font-mono text-sm leading-7 text-ink outline-none placeholder:text-slate/60"
          id="problem"
          onChange={(event) => setProblemText(event.target.value)}
          placeholder={"在这里粘贴算法题文本，例如：\n给定一个整数数组 nums 和一个目标值 target……"}
          value={problemText}
        />
      </div>
      <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate">
          {disabled ? "解题接口将在下一开发阶段接入。" : "提交后将生成结构化题目解析。"}
        </p>
        <button
          className="button-primary inline-flex"
          disabled={disabled || !problemText.trim()}
          type="submit"
        >
          生成题目解析
        </button>
      </div>
    </form>
  );
}

