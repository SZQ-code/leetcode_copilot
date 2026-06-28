interface OriginalProblemPanelProps {
  content: string;
  problemId: number;
}

export function OriginalProblemPanel({
  content,
  problemId,
}: OriginalProblemPanelProps) {
  return (
    <section className="panel">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="eyebrow">ORIGINAL</p>
          <h2 className="mt-1 text-xl font-bold">原始题目</h2>
        </div>
        <span className="font-mono text-xs text-slate">#{problemId}</span>
      </header>
      <pre className="whitespace-pre-wrap p-5 font-mono text-sm leading-7 text-slate">
        {content}
      </pre>
    </section>
  );
}
