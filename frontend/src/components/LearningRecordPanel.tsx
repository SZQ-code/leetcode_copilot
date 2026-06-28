import type { MasteryStatus } from "../types/problem";

const masteryStatuses: MasteryStatus[] = ["未掌握", "学习中", "已掌握"];

interface LearningRecordPanelProps {
  masteryStatus: MasteryStatus;
  notes: string;
  onMasteryStatusChange: (status: MasteryStatus) => void;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
  saveError: string | null;
  saveState: "idle" | "saving" | "saved" | "error";
}

export function LearningRecordPanel({
  masteryStatus,
  notes,
  onMasteryStatusChange,
  onNotesChange,
  onSave,
  saveError,
  saveState,
}: LearningRecordPanelProps) {
  return (
    <section className="panel p-5">
      <p className="eyebrow">LEARNING RECORD</p>
      <h2 className="mt-2 text-xl font-bold">掌握状态与备注</h2>

      <div className="mt-6">
        <label className="text-sm font-semibold" htmlFor="mastery-status">
          掌握状态
        </label>
        <select
          className="mt-2 w-full border border-line bg-surface px-4 py-3 text-sm text-ink"
          id="mastery-status"
          onChange={(event) =>
            onMasteryStatusChange(event.target.value as MasteryStatus)
          }
          value={masteryStatus}
        >
          {masteryStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm font-semibold" htmlFor="personal-notes">
            个人备注
          </label>
          <span className="font-mono text-xs text-slate">
            {notes.length} / 5000
          </span>
        </div>
        <textarea
          className="mt-2 min-h-36 w-full resize-y border border-line bg-surface px-4 py-3 text-sm leading-6 text-ink outline-none placeholder:text-slate/60"
          id="personal-notes"
          maxLength={5000}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="记录卡住的地方、复习重点或自己的解法。"
          value={notes}
        />
      </div>

      {saveState === "saved" ? (
        <p className="mt-4 text-sm font-semibold text-cobalt" role="status">
          学习记录已保存。
        </p>
      ) : saveState === "error" ? (
        <p className="mt-4 text-sm text-code" role="alert">
          {saveError}
        </p>
      ) : null}

      <button
        className="button-primary mt-5 inline-flex w-full"
        disabled={saveState === "saving"}
        onClick={onSave}
        type="button"
      >
        {saveState === "saving" ? "正在保存…" : "保存学习记录"}
      </button>
    </section>
  );
}
