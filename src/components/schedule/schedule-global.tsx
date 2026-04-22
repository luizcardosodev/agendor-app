"use client";

import {
  DndContext,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  rectIntersection,
  type DragEndEvent,
  type DragStartEvent
} from "@dnd-kit/core";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useAgenda } from "@/components/schedule/hooks/useAgenda";

import { AppointmentDragOverlay } from "./components/appointment/appointment-drag-overlay";
import { ScheduleDialog } from "./components/dialog/schedule-dialog";
import { ScheduleSidebar } from "./components/sidebar/sidebar-schedule";
import { SettingsSidebar } from "./components/sidebar/settings-sidebar";
import { SidebarInset, SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

import { ScheduleAppointment } from "./lib/schedule-mock";
import { WeeklyGrid } from "./components/views/schedule-weekly/weekly-grid";
import { DailyGrid } from "./components/views/schedule-daily/daily-grid";
import { MonthlyGrid } from "./components/views/schedule-monthly/monthly-grid";

export function ScheduleGlobal() {
  const agenda = useAgenda();
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState<ScheduleAppointment | null>(null);
  const [colWidth, setColWidth] = useState(0);
  const colRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsHydrated(true);
    agenda.goToToday();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const updateLayout = () => {
      if (colRef.current) {
        setColWidth(colRef.current.offsetWidth);
      }
      // Switch to day view on mobile screens (< 1024px)
      if (window.innerWidth < 1024 && agenda.viewType !== 'day') {
        agenda.setViewType('day');
      }
    };
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [agenda.weekDays, isHydrated, agenda.viewType]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveAppointment(event.active.data.current as ScheduleAppointment);
    if (colRef.current) {
      setColWidth(colRef.current.offsetWidth);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveAppointment(null);

    if (over) {
      const appointmentId = active.id as string;
      const { dayKey, slot } = over.data.current as { dayKey: string; slot: string };
      agenda.rescheduleAppointment(appointmentId, dayKey, slot);
    }
  }

  if (!isHydrated) return null;

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true} className="h-full min-h-0 ">
        <DndContext
          collisionDetection={rectIntersection}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          sensors={sensors}
        >
          <motion.div
            animate={{ opacity: 1 }}
            className="flex w-full"
            initial={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex w-full min-h lg:gap-4">
              <ScheduleSidebar
                filterSummaryCount={agenda.filterSummaryCount}
                filters={agenda.filters}
                getMiniCalendarDayLabel={agenda.getMiniCalendarDayLabel}
                isCurrentMonthDay={agenda.isCurrentMonthDay}
                isOptionsExpanded={agenda.isOptionsExpanded}
                miniCalendarDate={agenda.miniCalendarDate}
                monthDays={agenda.monthDays}
                selectedDate={agenda.selectedDate}
                weekDays={agenda.weekDays}
                viewType={agenda.viewType}
                onNextMonth={agenda.goToNextMiniCalendarMonth}
                onPreviousMonth={agenda.goToPreviousMiniCalendarMonth}
                onSelectDate={agenda.setSelectedDate}
                onToggleFilter={agenda.toggleFilter}
                onToggleOptions={() => agenda.setIsOptionsExpanded(!agenda.isOptionsExpanded)}
                onCreate={() => agenda.openCreateDialog()}
              />

              <SidebarInset className="w-full flex-1 rounded-xl">
                <SidebarTrigger className="flex items-center px-4 py-3 lg:hidden border-b mb-2h-9 w-9" />
                {agenda.viewType === 'week' ? (
                  <WeeklyGrid
                    appointmentsByDay={agenda.appointmentsByDay}
                    currentClinicLabel={agenda.currentClinicLabel}
                    currentProfessionalLabel={agenda.currentProfessionalLabel}
                    currentWeekRangeLabel={agenda.currentWeekRangeLabel}
                    defaultDuration={agenda.defaultDuration}
                    getAppointmentEndTime={agenda.getAppointmentEndTime}
                    now={agenda.now}
                    selectedDate={agenda.selectedDate}
                    setDefaultDuration={agenda.setDefaultDuration}
                    stats={agenda.stats}
                    weekDays={agenda.weekDays}
                    startHour={agenda.startHour}
                    endHour={agenda.endHour}
                    onCreate={agenda.openCreateDialog}
                    onNextWeek={agenda.goToNextWeek}
                    onOpenAppointment={agenda.openAppointment}
                    onPreviousWeek={agenda.goToPreviousWeek}
                    onReschedule={agenda.rescheduleAppointment}
                    onToday={agenda.goToToday}
                    viewType={agenda.viewType}
                    onViewChange={agenda.setViewType}
                    onToggleFilterSidebar={() => agenda.setIsFilterSidebarOpen(!agenda.isFilterSidebarOpen)}
                    onToggleSettingsSidebar={() => agenda.setIsSettingsSidebarOpen(!agenda.isSettingsSidebarOpen)}
                  />
                ) : agenda.viewType === 'day' ? (
                  <DailyGrid
                    appointmentsByDay={agenda.appointmentsByDay}
                    currentClinicLabel={agenda.currentClinicLabel}
                    currentProfessionalLabel={agenda.currentProfessionalLabel}
                    currentDayLabel={agenda.currentWeekRangeLabel}
                    defaultDuration={agenda.defaultDuration}
                    getAppointmentEndTime={agenda.getAppointmentEndTime}
                    now={agenda.now}
                    selectedDate={agenda.selectedDate}
                    setDefaultDuration={agenda.setDefaultDuration}
                    stats={agenda.stats}
                    startHour={agenda.startHour}
                    endHour={agenda.endHour}
                    onCreate={agenda.openCreateDialog}
                    onNextDay={agenda.goToNextDay}
                    onOpenAppointment={agenda.openAppointment}
                    onPreviousDay={agenda.goToPreviousDay}
                    onToday={agenda.goToToday}
                    viewType={agenda.viewType}
                    onViewChange={agenda.setViewType}
                    onToggleFilterSidebar={() => agenda.setIsFilterSidebarOpen(!agenda.isFilterSidebarOpen)}
                    onToggleSettingsSidebar={() => agenda.setIsSettingsSidebarOpen(!agenda.isSettingsSidebarOpen)}
                  />
                ) : (
                  <MonthlyGrid
                    appointmentsByDay={agenda.appointmentsByDay}
                    currentMonthLabel={agenda.currentWeekRangeLabel}
                    now={agenda.now}
                    selectedDate={agenda.selectedDate}
                    monthDays={agenda.monthDays}
                    onCreate={() => agenda.openCreateDialog()}
                    onOpenAppointment={agenda.openAppointment}
                    onPreviousMonth={agenda.goToPreviousMonth}
                    onNextMonth={agenda.goToNextMonth}
                    onToday={agenda.goToToday}
                    viewType={agenda.viewType}
                    onViewChange={agenda.setViewType}
                    stats={agenda.stats}
                    onToggleFilterSidebar={() => agenda.setIsFilterSidebarOpen(!agenda.isFilterSidebarOpen)}
                    onToggleSettingsSidebar={() => agenda.setIsSettingsSidebarOpen(!agenda.isSettingsSidebarOpen)}
                    defaultDuration={agenda.defaultDuration}
                    setDefaultDuration={agenda.setDefaultDuration}
                    onSelectDate={agenda.setSelectedDate}
                    hideWeekends={agenda.hideWeekends}
                  />
                )}

                <SettingsSidebar
                  isOpen={agenda.isSettingsSidebarOpen}
                  onClose={() => agenda.setIsSettingsSidebarOpen(false)}
                  startHour={agenda.startHour}
                  endHour={agenda.endHour}
                  setStartHour={agenda.setStartHour}
                  setEndHour={agenda.setEndHour}
                  defaultDuration={agenda.defaultDuration}
                  setDefaultDuration={agenda.setDefaultDuration}
                  hideWeekends={agenda.hideWeekends}
                  setHideWeekends={agenda.setHideWeekends}
                />
              </SidebarInset>
            </div>

            <ScheduleDialog
              onClose={agenda.closeDialog}
              onCreate={agenda.createAppointment}
              open={agenda.isDialogOpen}
              patientSuggestions={agenda.patientSuggestions}
              selectedDate={agenda.selectedDate}
              appointmentToEdit={agenda.selectedAppointment ?? agenda.preFilledAppointment}
              appointments={agenda.appointments}
              startHour={agenda.startHour}
              endHour={agenda.endHour}
            />
          </motion.div>

          <AppointmentDragOverlay
            activeAppointment={activeAppointment}
            colWidth={colWidth}
            currentDayKey={""}
            defaultDuration={agenda.defaultDuration}
            getAppointmentEndTime={agenda.getAppointmentEndTime}
            slotHeight={54}
          />
        </DndContext>
      </SidebarProvider>
    </TooltipProvider>
  );
}
