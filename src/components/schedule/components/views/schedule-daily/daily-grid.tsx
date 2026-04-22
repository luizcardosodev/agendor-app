"use client";

import { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import type { ScheduleAppointment as WeeklyAgendaAppointment } from "@/components/schedule/lib/schedule-mock";
import { GridTimeline } from "../../grid/grid-timeline";
import { GridDayColumn } from "../../grid/grid-day-column";
import { GridCurrentTime } from "../../grid/grid-current-time";
import { GridControls } from "../../grid/grid-controls";


const SLOT_HEIGHT = 54;

interface DailyGridProps {
  appointmentsByDay: Record<string, WeeklyAgendaAppointment[]>;
  currentClinicLabel: string;
  currentProfessionalLabel: string;
  currentDayLabel: string;
  defaultDuration: number;
  startHour: number;
  endHour: number;
  now: Date;
  selectedDate: Date;
  setDefaultDuration: (duration: number) => void;
  onCreate: (date: string, time: string) => void;
  onOpenAppointment: (id: string) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  viewType: 'day' | 'week' | 'month';
  onViewChange: (view: 'day' | 'week' | 'month') => void;
  getAppointmentEndTime: (date: string, time: string, duration: number) => string;
  stats: {
    total: number;
    completed: number;
    pending: number;
    scheduled: number;
    cancelled: number;
    hasOverduePending: boolean;
  };
  onToggleFilterSidebar: () => void;
  onToggleSettingsSidebar: () => void;
}

export function DailyGrid({
  appointmentsByDay,
  currentClinicLabel,
  currentProfessionalLabel,
  currentDayLabel,
  defaultDuration,
  startHour,
  endHour,
  now,
  selectedDate,
  setDefaultDuration,
  onCreate,
  onOpenAppointment,
  onPreviousDay,
  onNextDay,
  onToday,
  viewType,
  onViewChange,
  getAppointmentEndTime,
  stats,
  onToggleFilterSidebar,
  onToggleSettingsSidebar,
}: DailyGridProps) {
  const slots = useMemo(() => {
    return Array.from({ length: ((endHour - startHour) * 60) / defaultDuration + 1 }, (_, index) => {
      const totalMinutes = startHour * 60 + index * defaultDuration;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    });
  }, [defaultDuration, startHour, endHour]);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const timelineOffset = ((nowMinutes - startHour * 60) / defaultDuration) * SLOT_HEIGHT;
  const dayKey = format(selectedDate, "yyyy-MM-dd");

  return (
    <div className="flex flex-col overflow-hidden">

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] shadow-[0_15px_45px_rgba(16,36,62,0.06)]">
        <GridControls
          currentWeekRangeLabel={currentDayLabel}
          defaultDuration={defaultDuration}
          onNext={onNextDay}
          onPrevious={onPreviousDay}
          onToday={onToday}
          selectedDate={selectedDate}
          setDefaultDuration={setDefaultDuration}
          stats={stats}
          viewType={viewType}
          onViewChange={onViewChange}
          onToggleFilterSidebar={onToggleFilterSidebar}
          onToggleSettingsSidebar={onToggleSettingsSidebar}
        />

        <div className="min-h-0 flex-1 overflow-auto">
          <div className="min-w-0">
            {/* Day Header */}
            <div className="sticky top-0 z-40 grid grid-cols-[84px_1fr] bg-[var(--surface)]">
              <div className="" />
              <div
                className={cn(
                  "border-b px-6 py-4 flex items-center justify-start gap-3",
                  isSameDay(selectedDate, now) ? "bg-[var(--surface)]" : "bg-[var(--surface)]",
                )}
              >
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full text-[28px] font-semibold",
                    isSameDay(selectedDate, now) ? "bg-[var(--primary)] text-white" : "text-slate-700 dark:text-gray-200",
                  )}
                >
                  {format(selectedDate, "dd")}
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {format(selectedDate, "EEEE", { locale: ptBR })}
                </p>
              </div>
            </div>

            {/* Grid Body */}
            <div className="relative grid grid-cols-[84px_1fr] overflow-hidden">
              <GridTimeline slots={slots} />

              <GridDayColumn
                appointments={appointmentsByDay[dayKey] ?? []}
                day={selectedDate}
                dayKey={dayKey}
                defaultDuration={defaultDuration}
                getAppointmentEndTime={getAppointmentEndTime}
                isToday={isSameDay(selectedDate, now)}
                now={now}
                onOpenAppointment={onOpenAppointment}
                onCreate={onCreate}
                slotHeight={SLOT_HEIGHT}
                slots={slots}
                startHour={startHour}
              />

              {isSameDay(selectedDate, now) && (
                <GridCurrentTime now={now} timelineOffset={timelineOffset} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
