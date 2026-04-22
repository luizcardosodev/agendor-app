"use client";

interface GridTimelineProps {
  slots: string[];
}

export function GridTimeline({ slots }: GridTimelineProps) {
  return (
    <div className="border-r border-[var(--surface-soft)] bg-[var(--surface)]">
      {slots.map((slot) => (
        <div
          className="flex h-[54px] items-start justify-center border-b border-[var(--surface-muted)] pt-2 text-sm font-semibold text-slate-400 dark:text-gray-500"
          key={slot}
        >
          {slot}
        </div>
      ))}
    </div>
  );
}
