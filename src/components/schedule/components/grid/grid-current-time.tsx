"use client";

import { format } from "date-fns";

interface GridCurrentTimeProps {
  now: Date;
  timelineOffset: number;
}

export function GridCurrentTime({ now, timelineOffset }: GridCurrentTimeProps) {
  if (timelineOffset < 0) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 z-10" style={{ top: timelineOffset }}>
      <div className="absolute left-0 flex -translate-y-1/2 items-center justify-center" style={{ width: 84 }}>
        <span className="rounded-full bg-[#EF4444] px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-white shadow-[0_10px_24px_rgba(239,68,68,0.25)]">
          {format(now, "HH:mm")}
        </span>
      </div>
      <div className="absolute left-[84px] right-0 flex -translate-y-1/2 items-center">
        <span className="absolute -left-2 h-4 w-4 rounded-full border-4 border-white bg-[#EF4444]" />
        <span className="h-[2px] w-full bg-[#EF4444]" />
      </div>
    </div>
  );
}
