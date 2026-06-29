interface TagBadgeProps {
  label: string;
  tone?: "default" | "accent";
}

export function TagBadge({ label, tone = "default" }: TagBadgeProps) {
  const toneClass =
    tone === "accent"
      ? "border-cobalt/35 bg-mist text-cobalt"
      : "border-line bg-shell text-slate";

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 font-mono text-[0.68rem] font-medium ${toneClass}`}
    >
      {label}
    </span>
  );
}
