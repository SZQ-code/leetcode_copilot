interface TagBadgeProps {
  label: string;
  tone?: "default" | "accent";
}

export function TagBadge({ label, tone = "default" }: TagBadgeProps) {
  const toneClass =
    tone === "accent"
      ? "border-cobalt bg-mist text-cobalt"
      : "border-line bg-paper text-slate";

  return (
    <span
      className={`inline-flex border px-2.5 py-1 font-mono text-xs font-medium ${toneClass}`}
    >
      {label}
    </span>
  );
}

