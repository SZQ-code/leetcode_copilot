interface OriginalProblemPanelProps {
  content: string;
  problemId: number;
}

export function OriginalProblemPanel({
  content,
  problemId,
}: OriginalProblemPanelProps) {
  return (
    <section className="panel overflow-hidden">
      <header className="panel-header bg-shell">
        <div>
          <p className="eyebrow">SOURCE / PROBLEM</p>
          <h2 className="mt-1 text-xl font-bold">原始题目</h2>
        </div>
        <span className="status-chip">#{problemId}</span>
      </header>
      <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap p-5 font-mono text-sm leading-7 text-slate">
        {content}
      </pre>
    </section>
  );
}
