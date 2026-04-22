"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { SidebarCalendar } from "./sidebar-calendar";
interface ScheduleSidebarProps {
  filterSummaryCount: number;
  isOptionsExpanded: boolean;
  miniCalendarDate: Date;
  monthDays: Date[];
  selectedDate: Date;
  weekDays: Date[];
  viewType: 'day' | 'week' | 'month';
  onNextMonth: () => void;
  onPreviousMonth: () => void;
  onSelectDate: (date: Date) => void;
  onToggleOptions: () => void;
  onCreate: () => void;
  filters: {
    showArchivedAppointments: boolean;
    showCancelledPatients: boolean;
    showExpiredPatients: boolean;
  };
  isCurrentMonthDay: (date: Date) => boolean;
  getMiniCalendarDayLabel: (date: Date) => string;
  onToggleFilter: (
    key:
      | "showArchivedAppointments"
      | "showCancelledPatients"
      | "showExpiredPatients",
  ) => void;
}

export function ScheduleSidebar({
  isCurrentMonthDay,
  miniCalendarDate,
  monthDays,
  selectedDate,
  weekDays,
  viewType,
  onNextMonth,
  onPreviousMonth,
  onSelectDate,
  onCreate,
  getMiniCalendarDayLabel,
}: ScheduleSidebarProps) {
  const { isMobile } = useSidebar();

  return (
    <Sidebar collapsible={isMobile ? "offcanvas" : "none"} className="bg-white rounded-xl border">
      <SidebarHeader className="pl-4 pr-4 mt-4">
        <Button
          size="lg"
          onClick={onCreate}
          type="button"
        >
          <Plus />
          Criar
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarCalendar
          getMiniCalendarDayLabel={getMiniCalendarDayLabel}
          isCurrentMonthDay={isCurrentMonthDay}
          miniCalendarDate={miniCalendarDate}
          monthDays={monthDays}
          selectedDate={selectedDate}
          weekDays={weekDays}
          viewType={viewType}
          onNextMonth={onNextMonth}
          onPreviousMonth={onPreviousMonth}
          onSelectDate={onSelectDate}
        />
      </SidebarContent>
    </Sidebar>
  );
}
