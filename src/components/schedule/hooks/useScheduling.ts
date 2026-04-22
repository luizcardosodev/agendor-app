"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect } from "react";

import { patientPool, quickCreateSlots } from "@/lib/mock-data";
// import { buildDateTime, cn } from "@/lib/utils";
import { useSchedulingStore } from "@/components/schedule/store/scheduling-store";
import type { Appointment } from "@/types/scheduling";

const mobileQuery = "(max-width: 768px)";

export function useScheduling() {
  const store = useSchedulingStore();
  const {
    appointments,
    filters,
    selectedDate,
    viewMode,
    expandedDay,
    selectedAppointment,
    isAppointmentOpen,
    isNewAppointmentOpen,
    setViewMode,
  } = store;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia(mobileQuery);
    const syncView = (matches: boolean) => {
      if (matches && store.viewMode === "month") {
        setViewMode("day");
      }
    };

    syncView(media.matches);

    const listener = (event: MediaQueryListEvent) => syncView(event.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [setViewMode, store.viewMode]);

  const filteredAppointments = appointments
    .filter((appointment) => (filters.status === "Todos" ? true : appointment.status === filters.status))
    .filter((appointment) => (filters.type === "Todos" ? true : appointment.type === filters.type))
    // .sort((first, second) => buildDateTime(first.date, first.time).getTime() - buildDateTime(second.date, second.time).getTime());

  const selectedDateAppointments = filteredAppointments.filter((appointment) =>
    isSameDay(parseISO(appointment.date), selectedDate),
  );

  const monthStart = startOfWeek(startOfMonth(selectedDate), {
    locale: ptBR,
    weekStartsOn: 1,
  });
  const monthEnd = endOfWeek(endOfMonth(selectedDate), {
    locale: ptBR,
    weekStartsOn: 1,
  });
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate, { locale: ptBR, weekStartsOn: 1 }),
    end: endOfWeek(selectedDate, { locale: ptBR, weekStartsOn: 1 }),
  });

  const appointmentMap = filteredAppointments.reduce<Record<string, Appointment[]>>((accumulator, appointment) => {
    accumulator[appointment.date] ??= [];
    accumulator[appointment.date].push(appointment);
    return accumulator;
  }, {});

  return {
    ...store,
    appointmentMap,
    filteredAppointments,
    selectedDateAppointments,
    monthDays,
    weekDays,
    expandedDay,
    selectedAppointment,
    isAppointmentOpen,
    isNewAppointmentOpen,
    headingLabel:
      viewMode === "month"
        ? format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })
        : viewMode === "week"
          ? `${format(weekDays[0], "dd MMM", { locale: ptBR })} - ${format(weekDays[6], "dd MMM yyyy", {
            locale: ptBR,
          })}`
          : format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
    patientSuggestions: patientPool,
    quickCreateSlots,
  };
}
