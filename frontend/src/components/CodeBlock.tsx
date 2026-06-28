interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "python" }: CodeBlockProps) {
  return (
    <div className="overflow-hidden bg-ink text-white">
      <div className="flex items-center justify-between border-b border-white/15 px-4 py-3">
        <span className="font-mono text-xs">solution.{language === "python" ? "py" : "txt"}</span>
        <span className="font-mono text-xs text-white/55">{language}</span>
      </div>
      <pre className="overflow-x-auto p-5 text-sm leading-7">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}

