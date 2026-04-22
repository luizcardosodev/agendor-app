"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";

interface SidebarCalendarProps {
  miniCalendarDate: Date;
  monthDays: Date[];
  selectedDate: Date;
  weekDays: Date[];
  viewType: 'day' | 'week' | 'month';
  onNextMonth: () => void;
  onPreviousMonth: () => void;
  onSelectDate: (date: Date) => void;
  isCurrentMonthDay: (date: Date) => boolean;
  getMiniCalendarDayLabel: (date: Date) => string;
}



export function SidebarCalendar({
  miniCalendarDate,
  monthDays,
  selectedDate,
  weekDays,
  viewType,
  onNextMonth,
  onPreviousMonth,
  onSelectDate,
  isCurrentMonthDay,
  getMiniCalendarDayLabel,
}: SidebarCalendarProps) {
  const selectedWeekLookup = viewType === 'week'
    ? new Set(weekDays.map((day) => format(day, "yyyy-MM-dd")))
    : new Set<string>();

  return (
    <div className="flex flex-col m-2">
      <div className="flex items-center justify-between">
        <Button onClick={onPreviousMonth} size="icon" type="button" variant="ghost">
          <ChevronLeft />
        </Button>
        <p className="text-[22px] font-bold capitalize text-[var(--primary)]">
          {format(miniCalendarDate, "MMMM yyyy", { locale: ptBR })}
        </p>
        <Button onClick={onNextMonth} size="icon" type="button" variant="ghost">
          <ChevronRight />
        </Button>
      </div>

      <Calendar
        className="w-full"
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onSelectDate(date)}
        month={miniCalendarDate}
        locale={ptBR}
        showOutsideDays={true}
        classNames={{
          month_caption: "hidden",
          nav: "hidden"
        }}
        components={{
          DayButton: ({ day, modifiers, ...props }) => {
            const isSelected = modifiers.selected;
            const key = format(day.date, "yyyy-MM-dd");
            const isInWeek = selectedWeekLookup.has(key);
            const isInCurrentMonth = isCurrentMonthDay(day.date);

            return (
              <button
                {...props}
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition",
                  isSelected
                    ? "bg-[var(--primary)] text-white shadow-[0_12px_24px_rgba(16,36,62,0.15)]"
                    : isInWeek
                      ? "bg-[var(--surface-soft)] text-slate-700 dark:text-gray-200"
                      : isInCurrentMonth
                        ? "text-slate-500 dark:text-gray-400 hover:bg-[var(--background)]"
                        : "text-slate-300 dark:text-gray-600",
                )}
                type="button"
              >
                {getMiniCalendarDayLabel(day.date)}
              </button>
            );
          },
        }}
      />
    </div>
  );
}
