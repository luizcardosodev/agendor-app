"use client";

import { DragOverlay } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { getAppointmentStatusClasses, type ScheduleAppointment } from "@/components/schedule/lib/schedule-mock";
import { AppointmentCardContent } from "./appointment-card-content";

interface AppointmentDragOverlayProps {
  activeAppointment: ScheduleAppointment | null;
  currentDayKey: string;
  colWidth: number;
  getAppointmentEndTime: (date: string, time: string, duration: number) => string;
  slotHeight: number;
  defaultDuration: number;
}

export function AppointmentDragOverlay({
  activeAppointment,
  currentDayKey,
  colWidth,
  getAppointmentEndTime,
  slotHeight,
  defaultDuration,
}: AppointmentDragOverlayProps) {
  if (!activeAppointment) return null;

  return (
    <DragOverlay dropAnimation={null}>
      <div
        className={cn(
          "overflow-hidden rounded-[6px] border px-3 py-2 text-left shadow-[0_20px_50px_rgba(15,23,42,0.15)] ring-2 ring-[var(--primary)] ring-offset-2 cursor-grabbing",
          getAppointmentStatusClasses(activeAppointment.status),
        )}
        style={{
          height: (activeAppointment.duration / defaultDuration) * slotHeight,
          width: colWidth - 16,
        }}
      >
        <AppointmentCardContent
          appointment={activeAppointment}
          getAppointmentEndTime={getAppointmentEndTime}
          isCurrentDay={activeAppointment.date === currentDayKey}
        />
      </div>
    </DragOverlay>
  );
}

