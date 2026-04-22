"use client";

import { addDays, addMonths, addWeeks, format, parseISO, subDays, subMonths, subWeeks } from "date-fns";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { mockAppointments } from "@/lib/mock-data";
import { checkOverlap } from "@/lib/utils";
import type {
  Appointment,
  AppointmentFilters,
  AppointmentStatus,
  NewAppointmentInput,
  ViewMode,
} from "@/types/scheduling";

interface SchedulingStore {
  appointments: Appointment[];
  filters: AppointmentFilters;
  viewMode: ViewMode;
  selectedDate: Date;
  expandedDay: string | null;
  selectedAppointment: Appointment | null;
  isAppointmentOpen: boolean;
  isNewAppointmentOpen: boolean;
  setViewMode: (mode: ViewMode) => void;
  setSelectedDate: (date: Date) => void;
  setFilter: <T extends keyof AppointmentFilters>(
    key: T,
    value: AppointmentFilters[T],
  ) => void;
  toggleExpandedDay: (dateKey: string) => void;
  openAppointment: (appointment: Appointment) => void;
  closeAppointment: () => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  updateAppointmentNotes: (id: string, notes: string) => void;
  openNewAppointment: (date?: Date) => void;
  closeNewAppointment: () => void;
  addAppointment: (payload: NewAppointmentInput, professionalId: string) => void;
  isTimeSlotAvailable: (date: string, time: string, duration: number, excludeId?: string) => boolean;
  rescheduleAppointment: (id: string, date: string, time: string) => boolean;
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
}

export const useSchedulingStore = create<SchedulingStore>()(
  persist(
    (set, get) => ({
      appointments: mockAppointments,
      filters: {
        status: "Todos",
        type: "Todos",
      },
      viewMode: "month",
      selectedDate: new Date(),
      expandedDay: null,
      selectedAppointment: null,
      isAppointmentOpen: false,
      isNewAppointmentOpen: false,
      setViewMode: (mode) => set({ viewMode: mode }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setFilter: (key, value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        })),
      toggleExpandedDay: (dateKey) =>
        set((state) => ({
          expandedDay: state.expandedDay === dateKey ? null : dateKey,
        })),
      openAppointment: (appointment) =>
        set({
          selectedAppointment: appointment,
          isAppointmentOpen: true,
        }),
      closeAppointment: () =>
        set({
          isAppointmentOpen: false,
          selectedAppointment: null,
        }),
      updateAppointmentStatus: (id, status) =>
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === id ? { ...appointment, status } : appointment,
          ),
          selectedAppointment:
            state.selectedAppointment?.id === id
              ? { ...state.selectedAppointment, status }
              : state.selectedAppointment,
        })),
      updateAppointmentNotes: (id, notes) =>
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === id ? { ...appointment, notes } : appointment,
          ),
          selectedAppointment:
            state.selectedAppointment?.id === id
              ? { ...state.selectedAppointment, notes }
              : state.selectedAppointment,
        })),
      openNewAppointment: (date) =>
        set((state) => ({
          selectedDate: date ?? state.selectedDate,
          isNewAppointmentOpen: true,
        })),
      closeNewAppointment: () => set({ isNewAppointmentOpen: false }),
      addAppointment: (payload, professionalId) => {
        const { appointments } = get();
        if (checkOverlap(payload, appointments)) {
          return;
        }

        set((state) => ({
          appointments: [
            {
              id: `apt-${crypto.randomUUID()}`,
              professionalId,
              ...payload,
            },
            ...state.appointments,
          ],
          isNewAppointmentOpen: false,
          selectedDate: parseISO(payload.date),
          expandedDay: format(parseISO(payload.date), "yyyy-MM-dd"),
        }));
      },
      isTimeSlotAvailable: (date, time, duration, excludeId) => {
        const { appointments } = get();
        const otherAppointments = excludeId 
          ? appointments.filter(a => a.id !== excludeId)
          : appointments;
        return !checkOverlap({ date, time, duration }, otherAppointments);
      },
      rescheduleAppointment: (id, date, time) => {
        const { appointments, isTimeSlotAvailable } = get();
        const appointment = appointments.find((a) => a.id === id);
        if (!appointment) return false;

        if (!isTimeSlotAvailable(date, time, appointment.duration, id)) {
          return false;
        }

        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, date, time } : a
          ),
        }));
        return true;
      },
      goToToday: () => set({ selectedDate: new Date(), expandedDay: null }),
      goToPrevious: () => {
        const { selectedDate, viewMode } = get();

        const nextDate =
          viewMode === "month"
            ? subMonths(selectedDate, 1)
            : viewMode === "week"
              ? subWeeks(selectedDate, 1)
              : subDays(selectedDate, 1);

        set({ selectedDate: nextDate, expandedDay: null });
      },
      goToNext: () => {
        const { selectedDate, viewMode } = get();

        const nextDate =
          viewMode === "month"
            ? addMonths(selectedDate, 1)
            : viewMode === "week"
              ? addWeeks(selectedDate, 1)
              : addDays(selectedDate, 1);

        set({ selectedDate: nextDate, expandedDay: null });
      },
    }),
    {
      name: "scheduling-storage",
    },
  ),
);
