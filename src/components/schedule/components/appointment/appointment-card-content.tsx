"use client";

import { CheckCheck, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { ScheduleAppointment } from "@/components/schedule/lib/schedule-mock";

interface AppointmentCardContentProps {
  appointment: ScheduleAppointment;
  isCurrentDay: boolean;
  getAppointmentEndTime: (date: string, time: string, duration: number) => string;
}

export function AppointmentCardContent({
  appointment,
  isCurrentDay,
  getAppointmentEndTime,
}: AppointmentCardContentProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-1">
        <div className="text-[11px] font-semibold">
          {appointment.time} - {getAppointmentEndTime(appointment.date, appointment.time, appointment.duration)}
        </div>
        {appointment.status === "Confirmado" && <CheckCircle2 className="h-3 w-3 shrink-0 text-current opacity-70" />}
        {appointment.status === "Pendente" && <Clock className="h-3 w-3 shrink-0 text-current opacity-70" />}
        {appointment.status === "Cancelado" && <XCircle className="h-3 w-3 shrink-0 text-current opacity-70" />}
        {appointment.status === "Concluído" && <CheckCheck className="h-3 w-3 shrink-0 text-current opacity-70" />}
      </div>
      <div className="mt-1 text-[13px] font-semibold leading-tight text-current">
        {appointment.patientName}
      </div>
      
      {appointment.notes && (
        <div className="mt-auto pt-1 w-full">
          <div className="w-full truncate rounded-[4px] bg-black/5 px-1.5 py-0.5 text-[10px] font-medium text-current/80">
            {appointment.notes}
          </div>
        </div>
      )}
    </>
  );
}
