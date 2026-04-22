"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subWeeks,
  addWeeks,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";

import { patientPool } from "@/lib/mock-data";
import {
  getAppointmentEndTime,
  type ScheduleAppointment as WeeklyAgendaAppointment,
} from "@/components/schedule/lib/schedule-mock";
import { checkOverlap } from "@/lib/utils";
import type { AppointmentStatus, AppointmentType } from "@/types/scheduling";

export interface AgendaFilters {
  showArchivedAppointments: boolean;
  showCancelledPatients: boolean;
  showExpiredPatients: boolean;
}

export interface AgendaCreateInput {
  id?: string;
  patientName: string;
  date: string;
  time: string;
  duration: 15 | 30 | 45 | 60;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  isBlocked?: boolean;
}

const monthWeekStartsOn = 0;
const scheduleWeekStartsOn = 1;

import { useAgendaStore } from "@/components/schedule/store/agenda-store";

export function useAgenda() {
  const {
    appointments,
    setAppointments,
    selectedDate,
    setSelectedDate,
    filters,
    setFilters,
    defaultDuration,
    setDefaultDuration,
    viewType,
    setViewType,
    getStats,
    isFilterSidebarOpen,
    setIsFilterSidebarOpen,
    isSettingsSidebarOpen,
    setIsSettingsSidebarOpen,
    startHour,
    setStartHour,
    endHour,
    setEndHour,
    isOptionsExpanded,
    setIsOptionsExpanded,
    hideWeekends,
    setHideWeekends,
    setHighlightedAppointmentId,
  } = useAgendaStore();

  const [miniCalendarDate, setMiniCalendarDate] = useState(() => selectedDate);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [preFilledAppointment, setPreFilledAppointment] = useState<AgendaCreateInput | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setMiniCalendarDate(selectedDate);
  }, [selectedDate]);

  const weekDays = useMemo(
    () => {
      const allDays = eachDayOfInterval({
        start: startOfWeek(selectedDate, { weekStartsOn: scheduleWeekStartsOn }),
        end: endOfWeek(selectedDate, { weekStartsOn: scheduleWeekStartsOn }),
      });
      return hideWeekends ? allDays.filter((d) => {
        const iso = d.getDay(); // 0 = Sun, 6 = Sat
        return iso !== 0 && iso !== 6;
      }) : allDays;
    },
    [selectedDate, hideWeekends],
  );

  const monthDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(miniCalendarDate), { weekStartsOn: monthWeekStartsOn }),
        end: endOfWeek(endOfMonth(miniCalendarDate), { weekStartsOn: monthWeekStartsOn }),
      }),
    [miniCalendarDate],
  );

  const visibleAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => {
          const targetDays = viewType === 'month' ? monthDays : weekDays;
          return targetDays.some((day) => isSameDay(parseISO(appointment.date), day));
        })
        .filter((appointment) => {
          if (viewType === 'month') return true;
          const [hours, minutes] = appointment.time.split(":").map(Number);
          const appStartTotalMinutes = hours * 60 + minutes;
          return appStartTotalMinutes >= startHour * 60 && appStartTotalMinutes < endHour * 60;
        })
        .filter((appointment) => (filters.showArchivedAppointments ? true : !appointment.archived))
        .filter((appointment) => (filters.showCancelledPatients ? true : appointment.status !== "Cancelado"))
        .filter((appointment) => (filters.showExpiredPatients ? true : !appointment.expired))
        .sort((first, second) => {
          const firstStart = new Date(`${first.date}T${first.time}:00`);
          const secondStart = new Date(`${second.date}T${second.time}:00`);
          return firstStart.getTime() - secondStart.getTime();
        }),
    [appointments, filters, weekDays, monthDays, viewType],
  );

  const selectedAppointment =
    appointments.find((appointment) => appointment.id === selectedAppointmentId) ?? null;

  const appointmentsByDay = useMemo(() => {
    return visibleAppointments.reduce<Record<string, WeeklyAgendaAppointment[]>>((accumulator, appointment) => {
      accumulator[appointment.date] ??= [];
      accumulator[appointment.date].push(appointment);
      return accumulator;
    }, {});
  }, [visibleAppointments]);

  const filterSummaryCount = [
    filters.showArchivedAppointments,
    filters.showCancelledPatients,
    filters.showExpiredPatients,
  ].filter(Boolean).length;

  function toggleFilter(key: keyof AgendaFilters) {
    setFilters({ [key]: !filters[key] });
  }

  function goToPreviousWeek() {
    setSelectedDate(subWeeks(selectedDate, 1));
  }

  function goToNextWeek() {
    setSelectedDate(addWeeks(selectedDate, 1));
  }

  function goToToday() {
    setSelectedDate(new Date());
  }

  function goToPreviousDay() {
    setSelectedDate(subDays(selectedDate, 1));
  }

  function goToNextDay() {
    setSelectedDate(addDays(selectedDate, 1));
  }

  function goToPreviousMiniCalendarMonth() {
    setMiniCalendarDate((current) => addMonths(current, -1));
  }

  function goToNextMiniCalendarMonth() {
    setMiniCalendarDate((current) => addMonths(current, 1));
  }

  function goToPreviousMonth() {
    setSelectedDate(addMonths(selectedDate, -1));
  }

  function goToNextMonth() {
    setSelectedDate(addMonths(selectedDate, 1));
  }

  function openAppointment(id: string) {
    setSelectedAppointmentId(id);
    setIsDialogOpen(true);
  }

  function updateAppointmentStatus(status: AppointmentStatus) {
    if (!selectedAppointmentId) {
      return;
    }

    setAppointments(
      appointments.map((appointment) =>
        appointment.id === selectedAppointmentId
          ? {
            ...appointment,
            status,
            stageLabel:
              status === "Confirmado"
                ? "Confirmado"
                : status === "Cancelado"
                  ? "Paciente cancelado"
                  : status === "Concluído"
                    ? "Paciente atendido"
                    : "Aguardando atendimento",
          }
          : appointment,
      ),
    );
  }

  function updateAppointmentNotes(notes: string) {
    if (!selectedAppointmentId) {
      return;
    }

    setAppointments(
      appointments.map((appointment) =>
        appointment.id === selectedAppointmentId ? { ...appointment, notes } : appointment,
      ),
    );
  }

  function openCreateDialog(date?: string, time?: string) {
    if (date) {
      setPreFilledAppointment({
        patientName: "",
        date: date,
        time: time || "",
        duration: defaultDuration as any,
        type: "Consulta",
        status: "Pendente",
      });
      setSelectedDate(parseISO(date));
    } else {
      setPreFilledAppointment(null);
    }
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setPreFilledAppointment(null);
    setSelectedAppointmentId(null);
  }

  function createAppointment(input: AgendaCreateInput) {
    if (selectedAppointmentId) {
      // Logic for editing
      if (checkOverlap(input, appointments.filter(a => a.id !== selectedAppointmentId))) {
        return;
      }

      setAppointments(
        appointments.map((a) => {
          if (a.id === selectedAppointmentId) {
            return {
              ...a,
              patientName: input.isBlocked ? "Horário Bloqueado" : input.patientName,
              date: input.date,
              time: input.time,
              duration: input.duration,
              type: input.type,
              status: input.status,
              notes: input.notes,
              isBlocked: input.isBlocked,
              detailLabel: input.isBlocked ? "Bloqueio" : input.type,
              stageLabel: input.isBlocked
                ? "Horário Bloqueado"
                : input.status === "Confirmado"
                  ? "Confirmado"
                  : input.status === "Cancelado"
                    ? "Paciente cancelado"
                    : input.status === "Concluído"
                      ? "Paciente atendido"
                      : input.type === "Teleconsulta"
                        ? "Horário online"
                        : "Aguardando atendimento",
              accent: input.isBlocked ? "slate" : a.accent,
            };
          }
          return a;
        })
      );

      setHighlightedAppointmentId(selectedAppointmentId);
      setTimeout(() => {
        setHighlightedAppointmentId(null);
      }, 3000);
      
      closeDialog();
      return;
    }

    // Logic for creating
    if (checkOverlap(input, appointments)) {
      return;
    }

    const nextAppointment: WeeklyAgendaAppointment = {
      id: input.id || `agenda-created-${crypto.randomUUID()}`,
      professionalId: "prof-ana-silva",
      patientName: input.isBlocked ? "Horário Bloqueado" : input.patientName,
      date: input.date,
      time: input.time,
      duration: input.duration,
      type: input.type,
      status: input.status,
      notes: input.notes,
      isBlocked: input.isBlocked,
      detailLabel: input.isBlocked ? "Bloqueio" : input.type,
      stageLabel: input.isBlocked
        ? "Horário Bloqueado"
        : input.status === "Confirmado"
          ? "Confirmado"
          : input.status === "Cancelado"
            ? "Paciente cancelado"
            : input.status === "Concluído"
              ? "Paciente atendido"
              : input.type === "Teleconsulta"
                ? "Horário online"
                : "Aguardando atendimento",
      accent: input.isBlocked ? "slate" : (
        input.type === "Exame"
          ? "green"
          : input.type === "Retorno"
            ? "violet"
            : input.type === "Teleconsulta"
              ? "teal"
              : "sky"
      ),
      online: !input.isBlocked && input.type === "Teleconsulta",
    };

    setAppointments([nextAppointment, ...appointments]);
    setSelectedDate(parseISO(input.date));
    
    setHighlightedAppointmentId(nextAppointment.id);
    setTimeout(() => {
      setHighlightedAppointmentId(null);
    }, 3000);
    
    closeDialog();
  }

  function rescheduleAppointment(id: string, date: string, time: string) {
    const appointment = appointments.find((a) => a.id === id);
    if (!appointment) return false;

    if (checkOverlap({ ...appointment, date, time }, appointments.filter(a => a.id !== id))) {
      return false;
    }

    setAppointments(
      appointments.map((a) => (a.id === id ? { ...a, date, time } : a)),
    );
    return true;
  }

  const stats = getStats(now, {
    start: startOfDay(
      viewType === 'month' ? monthDays[0] :
        viewType === 'day' ? selectedDate :
          weekDays[0]
    ),
    end: endOfDay(
      viewType === 'month' ? monthDays[monthDays.length - 1] :
        viewType === 'day' ? selectedDate :
          weekDays[weekDays.length - 1]
    )
  });

  return {
    appointments,
    appointmentsByDay,
    defaultDuration,
    setDefaultDuration,
    filterSummaryCount,
    filters,
    isDialogOpen,
    isOptionsExpanded,
    miniCalendarDate,
    monthDays,
    now,
    patientSuggestions: patientPool,
    selectedAppointment,
    preFilledAppointment,
    selectedDate,
    visibleAppointments,
    weekDays,
    stats,
    weekLabel: format(selectedDate, "MMMM yyyy", { locale: ptBR }),
    currentClinicLabel: "Clínica Pro Vitta - Moema",
    currentProfessionalLabel: "Ian Araújo - Clínica Geral",
    currentWeekRangeLabel: viewType === 'month'
      ? format(miniCalendarDate, "MMMM 'de' yyyy", { locale: ptBR })
      : viewType === 'week'
        ? `${format(weekDays[0], "dd")} - ${format(weekDays[weekDays.length - 1], "dd 'de' MMMM yyyy", {
          locale: ptBR,
        })}`
        : format(selectedDate, "dd 'de' MMMM yyyy", { locale: ptBR }),
    getAppointmentEndTime,
    getFormattedMonthDayLabel: (date: Date) => format(date, "dd"),
    getMiniCalendarDayLabel: (date: Date) => format(date, "d"),
    isCurrentMonthDay: (date: Date) => isSameMonth(date, miniCalendarDate),
    openAppointment,
    openCreateDialog,
    closeDialog,
    goToNextMiniCalendarMonth,
    goToNextWeek,
    goToPreviousMiniCalendarMonth,
    goToPreviousWeek,
    goToToday,
    setSelectedDate,
    setIsDialogOpen,
    setIsOptionsExpanded,
    toggleFilter,
    updateAppointmentNotes,
    updateAppointmentStatus,
    createAppointment,
    rescheduleAppointment,
    viewType,
    setViewType,
    goToNextDay,
    goToPreviousDay,
    goToNextMonth,
    goToPreviousMonth,
    isFilterSidebarOpen,
    setIsFilterSidebarOpen,
    isSettingsSidebarOpen,
    setIsSettingsSidebarOpen,
    startHour,
    setStartHour,
    endHour,
    setEndHour,
    hideWeekends,
    setHideWeekends,
    updateAppointmentDuration: useAgendaStore((state) => state.updateAppointmentDuration),
  };
}
