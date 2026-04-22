"use client";

import { useDroppable } from "@dnd-kit/core";
import { format, isBefore, isSameDay } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ScheduleAppointment } from "@/components/schedule/lib/schedule-mock";
import { AppointmentCard } from "../appointment/appointment-card";

interface DroppableSlotProps {
  dayKey: string;
  slot: string;
  onClick?: () => void;
}

function DroppableSlot({ dayKey, slot, onClick }: DroppableSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${dayKey}-${slot}`,
    data: { dayKey, slot },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        "h-[54px] border-b border-[var(--surface-muted)] transition-colors",
        onClick && "cursor-pointer hover:bg-[var(--surface-soft)]/50",
        isOver ? "bg-[var(--surface-soft)] border-[var(--surface-border)] ring-1 ring-inset ring-[var(--surface-border)]" : "",
      )}
    />
  );
}

interface GridDayColumnProps {
  day: Date;
  dayKey: string;
  isToday: boolean;
  slots: string[];
  appointments: ScheduleAppointment[];
  now: Date;
  startHour: number;
  slotHeight: number;
  defaultDuration: number;
  onOpenAppointment: (id: string) => void;
  onCreate?: (date: string, time: string) => void;
  getAppointmentEndTime: (date: string, time: string, duration: number) => string;
}

export function GridDayColumn({
  day,
  dayKey,
  isToday,
  slots,
  appointments,
  now,
  startHour,
  slotHeight,
  defaultDuration,
  onOpenAppointment,
  onCreate,
  getAppointmentEndTime,
}: GridDayColumnProps) {
  return (
    <div
      className={cn(
        "relative border-r border-[var(--surface-soft)] last:border-r-0",
        isToday ? "" : "",
        format(day, "i") === "6" || format(day, "i") === "7"
          ? "bg-[repeating-linear-gradient(-45deg,var(--surface-muted),var(--surface-muted)_4px,rgba(255,255,255,0.05)_4px,rgba(255,255,255,0.05)_10px)]"
          : "",
      )}
    >
      {slots.map((slot) => (
        <DroppableSlot
          dayKey={dayKey}
          key={`${dayKey}-${slot}`}
          slot={slot}
          onClick={onCreate ? () => onCreate(dayKey, slot) : undefined}
        />
      ))}

      <div className="pointer-events-none absolute inset-0">
        <AnimatePresence>
          {appointments.map((appointment, index) => {
            const [hours, minutes] = appointment.time.split(":").map(Number);
            const totalMinutes = hours * 60 + minutes;
            const top = ((totalMinutes - startHour * 60) / defaultDuration) * slotHeight;
            const height = (appointment.duration / defaultDuration) * slotHeight;

            const appointmentDate = new Date(day);
            appointmentDate.setHours(hours, minutes, 0, 0);

            const appointmentEndDate = new Date(appointmentDate);
            appointmentEndDate.setMinutes(appointmentDate.getMinutes() + appointment.duration);

            const isPast = isBefore(appointmentDate, now);
            const isOverdue = isBefore(appointmentEndDate, now) &&
              appointment.status !== "Concluído" &&
              appointment.status !== "Cancelado";

            return (
              <AppointmentCard
                appointment={appointment}
                getAppointmentEndTime={getAppointmentEndTime}
                index={index}
                isCurrentDay={isToday}
                isOverdue={isOverdue}
                isPast={isPast}
                key={appointment.id}
                onClick={onOpenAppointment}
                style={{ height, top }}
                defaultDuration={defaultDuration}
                slotHeight={slotHeight}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

