interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "python" }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-[#090d13] text-ink">
      <div className="flex items-center justify-between border-b border-line bg-shell px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-danger/65" />
            <span className="size-2 rounded-full bg-warning/65" />
            <span className="size-2 rounded-full bg-success/65" />
          </span>
          <span className="font-mono text-xs">
            solution.{language === "python" ? "py" : "txt"}
          </span>
        </div>
        <span className="font-mono text-[0.65rem] tracking-[0.08em] text-slate uppercase">
          {language}
        </span>
      </div>
      <pre className="overflow-x-auto p-5 text-sm leading-7">
        <code className="font-mono text-[#dce7f5]">{code}</code>
      </pre>
    </div>
  );
}
