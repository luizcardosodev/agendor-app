"use client";

import { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import type { ScheduleAppointment } from "@/components/schedule/lib/schedule-mock";
import { GridControls } from "../../grid/grid-controls";
import { GridCurrentTime } from "../../grid/grid-current-time";
import { GridDayColumn } from "../../grid/grid-day-column";
import { GridTimeline } from "../../grid/grid-timeline";

const SLOT_HEIGHT = 54;
interface WeeklyGridProps {
  appointmentsByDay: Record<string, ScheduleAppointment[]>;
  currentClinicLabel: string;
  currentProfessionalLabel: string;
  currentWeekRangeLabel: string;
  defaultDuration: number;
  startHour: number;
  endHour: number;
  now: Date;
  selectedDate: Date;
  setDefaultDuration: (duration: number) => void;
  weekDays: Date[];
  onCreate: (date: string, time: string) => void;
  onOpenAppointment: (id: string) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onReschedule: (id: string, date: string, time: string) => boolean;
  onToday: () => void;
  viewType: 'day' | 'week' | 'month';
  onViewChange: (view: 'day' | 'week' | 'month') => void;
  getAppointmentEndTime: (date: string, time: string, duration: number) => string;
  colRef?: React.RefObject<HTMLDivElement>;
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

export function WeeklyGrid({
  appointmentsByDay,
  currentClinicLabel,
  currentProfessionalLabel,
  currentWeekRangeLabel,
  defaultDuration,
  startHour,
  endHour,
  now,
  selectedDate,
  setDefaultDuration,
  weekDays,
  onCreate,
  onOpenAppointment,
  onPreviousWeek,
  onNextWeek,
  onToday,
  viewType,
  onViewChange,
  getAppointmentEndTime,
  colRef,
  stats,
  onToggleFilterSidebar,
  onToggleSettingsSidebar,
}: WeeklyGridProps) {
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

  return (
    <div className="flex overflow-hidden rounded-xl">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] shadow-[0_15px_45px_rgba(16,36,62,0.06)]">
        <GridControls
          currentWeekRangeLabel={currentWeekRangeLabel}
          defaultDuration={defaultDuration}
          onNext={onNextWeek}
          onPrevious={onPreviousWeek}
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
          {/* Day Headers */}
          <div
            className="sticky top-0 z-40"
            style={{ display: 'grid', gridTemplateColumns: `84px repeat(${weekDays.length}, minmax(0, 1fr))` }}
          >
            <div className="border-r border-b border-[var(--surface-soft)] bg-[var(--background)]" />
            {weekDays.map((day, index) => (
              <div
                className={cn(
                  "border-r border-b border-[var(--surface-soft)] px-4 py-3 text-center last:border-r-0",
                  isSameDay(day, now) ? "bg-[var(--background)]" : "bg-[var(--surface)]",
                )}
                key={day.toISOString()}
                ref={index === 0 ? colRef : null}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {format(day, "EEE", { locale: ptBR })}
                </p>
                <div
                  className={cn(
                    "mx-auto mt-2 flex h-11 w-11 items-center justify-center rounded-full text-[28px] font-semibold",
                    isSameDay(day, now) ? "bg-[var(--primary)] text-white" : "text-slate-700 dark:text-gray-200",
                  )}
                >
                  {format(day, "dd")}
                </div>
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div
            className="relative overflow-hidden"
            style={{ display: 'grid', gridTemplateColumns: `84px repeat(${weekDays.length}, minmax(0, 1fr))` }}
          >
            <GridTimeline slots={slots} />

            {weekDays.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd");
              return (
                <GridDayColumn
                  appointments={appointmentsByDay[dayKey] ?? []}
                  day={day}
                  dayKey={dayKey}
                  defaultDuration={defaultDuration}
                  getAppointmentEndTime={getAppointmentEndTime}
                  isToday={isSameDay(day, now)}
                  key={dayKey}
                  now={now}
                  onOpenAppointment={onOpenAppointment}
                  onCreate={onCreate}
                  slotHeight={SLOT_HEIGHT}
                  slots={slots}
                  startHour={startHour}
                />
              );
            })}

            {weekDays.some((day) => isSameDay(day, now)) && (
              <GridCurrentTime now={now} timelineOffset={timelineOffset} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



