import { ReactNode } from "react";

interface InterfaceStateProps {
  action?: ReactNode;
  description: string;
  label: string;
  title: string;
  tone?: "default" | "error" | "loading";
}

export function InterfaceState({
  action,
  description,
  label,
  title,
  tone = "default",
}: InterfaceStateProps) {
  const toneClasses = {
    default: "border-line",
    error: "border-danger/55",
    loading: "border-cobalt/45",
  }[tone];

  const markerClasses = {
    default: "bg-slate",
    error: "bg-danger",
    loading: "status-pulse bg-cobalt",
  }[tone];

  return (
    <section className={`panel border ${toneClasses}`}>
      <div className="flex min-h-48 flex-col justify-center p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${markerClasses}`}
          />
          <p className="eyebrow">{label}</p>
        </div>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em]">
          {title}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate">
          {description}
        </p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </section>
  );
}
