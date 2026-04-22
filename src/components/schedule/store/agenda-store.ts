"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  parseISO,
  isBefore,
  addMinutes
} from "date-fns";
import {
  createWeeklyAgendaAppointments,
  type ScheduleAppointment as WeeklyAgendaAppointment
} from "@/components/schedule/lib/schedule-mock";

export interface AgendaFilters {
  showArchivedAppointments: boolean;
  showCancelledPatients: boolean;
  showExpiredPatients: boolean;
}

interface AgendaState {
  appointments: WeeklyAgendaAppointment[];
  selectedDate: Date;
  filters: AgendaFilters;
  defaultDuration: number;
  viewType: 'day' | 'week' | 'month';
  isFilterSidebarOpen: boolean;
  isSettingsSidebarOpen: boolean;
  startHour: number;
  endHour: number;
  isOptionsExpanded: boolean;
  hideWeekends: boolean;
  highlightedAppointmentId: string | null;

  // Actions
  setAppointments: (appointments: WeeklyAgendaAppointment[]) => void;
  setSelectedDate: (date: Date) => void;
  setFilters: (filters: Partial<AgendaFilters>) => void;
  setDefaultDuration: (duration: number) => void;
  setViewType: (view: 'day' | 'week' | 'month') => void;
  setIsFilterSidebarOpen: (isOpen: boolean) => void;
  setIsSettingsSidebarOpen: (isOpen: boolean) => void;
  setStartHour: (hour: number) => void;
  setEndHour: (hour: number) => void;
  setIsOptionsExpanded: (isExpanded: boolean) => void;
  setHideWeekends: (hide: boolean) => void;
  setHighlightedAppointmentId: (id: string | null) => void;
  updateAppointmentDuration: (id: string, duration: 15 | 30 | 45 | 60) => void;
  updateAppointmentStatus: (id: string, status: any) => void;

  // Computed (Selectors)
  getStats: (now: Date, range?: { start: Date; end: Date }) => {
    total: number;
    completed: number;
    pending: number;
    scheduled: number;
    cancelled: number;
    hasOverduePending: boolean;
  };
}

export const useAgendaStore = create<AgendaState>()(
  persist(
    (set, get) => ({
      appointments: createWeeklyAgendaAppointments(new Date()),
      selectedDate: new Date(),
      filters: {
        showArchivedAppointments: false,
        showCancelledPatients: true,
        showExpiredPatients: false,
      },
      defaultDuration: 15,
      viewType: 'week',
      isFilterSidebarOpen: false,
      isSettingsSidebarOpen: false,
      startHour: 8,
      endHour: 20,
      isOptionsExpanded: true,
      hideWeekends: false,
      highlightedAppointmentId: null,

      setAppointments: (appointments) => set({ appointments }),
      setSelectedDate: (selectedDate) => set({ selectedDate }),
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      setDefaultDuration: (defaultDuration) => set({ defaultDuration }),
      setViewType: (viewType) => set({ viewType }),
      setIsFilterSidebarOpen: (isFilterSidebarOpen) => set({ isFilterSidebarOpen }),
      setIsSettingsSidebarOpen: (isSettingsSidebarOpen) => set({ isSettingsSidebarOpen }),
      setStartHour: (startHour) => set({ startHour }),
      setEndHour: (endHour) => set({ endHour }),
      setIsOptionsExpanded: (isOptionsExpanded) => set({ isOptionsExpanded }),
      setHideWeekends: (hideWeekends) => set({ hideWeekends }),
      setHighlightedAppointmentId: (id) => set({ highlightedAppointmentId: id }),
      updateAppointmentDuration: (id, duration) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, duration } : a
          ),
        })),
      updateAppointmentStatus: (id, status) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? {
              ...a,
              status,
              stageLabel:
                status === "Confirmado"
                  ? "Confirmado"
                  : status === "Cancelado"
                    ? "Paciente cancelado"
                    : status === "Concluído"
                      ? "Paciente atendido"
                      : "Aguardando atendimento",
            } : a
          ),
        })),

      getStats: (now, range) => {
        const { appointments } = get();

        const stats = appointments.reduce(
          (acc, app) => {
            const appDate = parseISO(app.date);

            // If range is provided, only count appointments within that range
            if (range && (isBefore(appDate, range.start) || isBefore(range.end, appDate))) {
              // But we still want to know if there's an overdue appointment ANYWHERE 
              // for the notification dot? Actually, the prompt implies the notification 
              // should go away if everything IS concluded.

              // Let's still check overdue globally for the notification dot logic
              if (app.status !== "Concluído" && app.status !== "Cancelado") {
                const appStart = parseISO(`${app.date}T${app.time}`);
                const appEnd = addMinutes(appStart, app.duration);
                if (isBefore(appEnd, now)) {
                  acc.hasOverduePending = true;
                }
              }
              return acc;
            }

            // Basic counts (ignoring Cancelled in total)
            if (app.status !== "Cancelado") {
              acc.total++;
            }

            if (app.status === "Concluído") acc.completed++;
            else if (app.status === "Pendente") acc.pending++;
            else if (app.status === "Confirmado") acc.scheduled++;
            else if (app.status === "Cancelado") acc.cancelled++;

            // Overdue check
            if (app.status !== "Concluído" && app.status !== "Cancelado") {
              const appStart = parseISO(`${app.date}T${app.time}`);
              const appEnd = addMinutes(appStart, app.duration);
              if (isBefore(appEnd, now)) {
                acc.hasOverduePending = true;
              }
            }

            return acc;
          },
          { total: 0, completed: 0, pending: 0, scheduled: 0, cancelled: 0, hasOverduePending: false },
        );

        return stats;
      },
    }),
    {
      name: "agenda-storage",
      version: 5,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        if (version < 2) {
          state.defaultDuration = 15;
        }
        if (version < 3) {
          state.startHour = 8;
          state.endHour = 20;
        }
        if (version < 4) {
          state.isOptionsExpanded = true;
        }
        if (version < 5) {
          state.hideWeekends = false;
        }
        return state as unknown as AgendaState;
      },
    },
  ),
);
