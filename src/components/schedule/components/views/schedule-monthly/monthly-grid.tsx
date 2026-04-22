"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isSameDay, isSameMonth, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import type { ScheduleAppointment } from "@/components/schedule/lib/schedule-mock";
import { GridControls } from "../../grid/grid-controls";

interface MonthlyGridProps {
  appointmentsByDay: Record<string, ScheduleAppointment[]>;
  currentMonthLabel: string;
  now: Date;
  selectedDate: Date;
  monthDays: Date[];
  onCreate: () => void;
  onOpenAppointment: (id: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  viewType: 'day' | 'week' | 'month';
  onViewChange: (view: 'day' | 'week' | 'month') => void;
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
  defaultDuration: number;
  setDefaultDuration: (duration: number) => void;
  onSelectDate: (date: Date) => void;
  hideWeekends: boolean;
}

export function MonthlyGrid({
  appointmentsByDay,
  currentMonthLabel,
  now,
  selectedDate,
  monthDays,
  onOpenAppointment,
  onPreviousMonth,
  onNextMonth,
  onToday,
  viewType,
  onViewChange,
  stats,
  onToggleFilterSidebar,
  onToggleSettingsSidebar,
  defaultDuration,
  setDefaultDuration,
  onSelectDate,
  hideWeekends,
}: MonthlyGridProps) {
  const filteredMonthDays = useMemo(() => {
    if (!hideWeekends) return monthDays;
    return monthDays.filter((day) => {
      const dayOfWeek = day.getDay();
      return dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude Sunday (0) and Saturday (6)
    });
  }, [monthDays, hideWeekends]);


  const todayStart = startOfDay(now);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-5 overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] shadow-[0_15px_45px_rgba(16,36,62,0.06)]">
        <GridControls
          currentWeekRangeLabel={currentMonthLabel}
          defaultDuration={defaultDuration}
          onNext={onNextMonth}
          onPrevious={onPreviousMonth}
          onToday={onToday}
          selectedDate={selectedDate}
          setDefaultDuration={setDefaultDuration}
          stats={stats}
          viewType={viewType}
          onViewChange={onViewChange}
          onToggleFilterSidebar={onToggleFilterSidebar}
          onToggleSettingsSidebar={onToggleSettingsSidebar}
        />

        <div className="min-h-0 flex-1 overflow-hidden flex flex-col">
          {/* Day of Week Headers */}
          <div className={cn("grid border-b border-[var(--surface-soft)] bg-[var(--surface-muted)]", hideWeekends ? "grid-cols-5" : "grid-cols-7")}>
            {filteredMonthDays.slice(0, hideWeekends ? 5 : 7).map((day) => (
              <div key={day.toISOString()} className="py-2.5 text-center border-r border-[var(--surface-soft)] last:border-r-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {format(day, "EEE", { locale: ptBR })}
                </p>
              </div>
            ))}
          </div>

          <div className={cn("grid flex-1 min-h-0 auto-rows-fr", hideWeekends ? "grid-cols-5" : "grid-cols-7")}>
            {filteredMonthDays.map((day, i) => {
              const dayKey = format(day, "yyyy-MM-dd");
              const dayAppointments = appointmentsByDay[dayKey] || [];
              // Filter out overlapping appointments to avoid UI stacking issues
              const filteredDayAppointments = (function () {
                const sorted = [...dayAppointments].sort((a, b) => a.time.localeCompare(b.time));
                const result = [];
                let lastEnd = -1;
                for (const app of sorted) {
                  const [h, m] = app.time.split(":").map(Number);
                  const start = h * 60 + m;
                  const end = start + app.duration;
                  if (start >= lastEnd) {
                    result.push(app);
                    lastEnd = end;
                  }
                  // overlapping appointments are skipped
                }
                return result;
              })();
              const isCurrentMonth = isSameMonth(day, selectedDate);
              const isCurrentDay = isSameDay(day, now);
              const isPast = isBefore(day, todayStart);

              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              return (
                <div
                  key={dayKey}
                  className={cn(
                    "group/day border-b border-r border-[var(--surface-soft)] px-2 pb-2 pt-3 flex flex-col gap-1 min-h-0 overflow-hidden transition-colors hover:bg-[var(--surface-soft)]/50",
                    isWeekend && "bg-[repeating-linear-gradient(-45deg,var(--surface-muted),var(--surface-muted)_4px,rgba(255,255,255,0.05)_4px,rgba(255,255,255,0.05)_10px)]",
                    !isCurrentMonth && "bg-[var(--surface-muted)]/50",
                    isPast && !isCurrentDay && "bg-[var(--surface-muted)] opacity-60 grayscale-[0.3]",
                    isCurrentDay && "bg-[var(--primary)]/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <button
                      onClick={() => {
                        onSelectDate(day);
                        onViewChange('day');
                      }}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition-transform hover:scale-110 active:scale-95",
                        isCurrentDay
                          ? "bg-[var(--primary)] text-white shadow-sm"
                          : isCurrentMonth
                            ? "text-slate-700 dark:text-gray-200 hover:bg-[var(--surface-soft)]"
                            : "text-slate-400 hover:bg-[var(--surface-soft)]"
                      )}
                    >
                      {format(day, "d")}
                    </button>
                    {dayAppointments.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover/day:opacity-100 transition-opacity">
                        {dayAppointments.length} {dayAppointments.length === 1 ? 'evento' : 'eventos'}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 overflow-hidden group-hover/day:overflow-y-auto flex-1 pr-0.5 calendar-scrollbar scroll-smooth">
                    <AnimatePresence mode="popLayout">
                      {filteredDayAppointments.map((app) => {
                        const [appHours, appMinutes] = app.time.split(":").map(Number);
                        const appDate = new Date(day);
                        appDate.setHours(appHours, appMinutes, 0, 0);
                        const appEndDate = new Date(appDate);
                        appEndDate.setMinutes(appDate.getMinutes() + app.duration);

                        const isOverdue = isBefore(appEndDate, now) &&
                          app.status !== "Concluído" &&
                          app.status !== "Cancelado";

                        const isAppPast = isBefore(appDate, now);

                        return (
                          <motion.div
                            key={app.id}
                            initial={{ opacity: 0, scale: 0.95, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            layout
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAppointment(app.id);
                            }}
                            className={cn(
                              "relative cursor-pointer truncate rounded px-2 py-1 text-[10px] font-medium transition-colors hover:brightness-95 shrink-0 overflow-hidden",
                              app.status === "Concluído" ? "bg-blue-100/90 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                                app.status === "Cancelado" ? "bg-red-100/90 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                                  app.status === "Confirmado" ? "bg-green-100/90 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                                    "bg-purple-100/90 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
                              isAppPast && "opacity-40 saturate-[0.5] grayscale-[0.4]"
                            )}
                            title={`${app.time} - ${app.patientName}`}
                          >
                            {isOverdue && (
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500" />
                            )}
                            {app.time} {app.patientName}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
