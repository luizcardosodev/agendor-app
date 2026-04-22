"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { z } from "zod";
import type { AgendaCreateInput } from "@/components/schedule/hooks/useAgenda";

export const agendaCreateSchema = z.object({
  patientName: z.string().optional(),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Horário é obrigatório"),
  duration: z.union([z.literal(15), z.literal(30), z.literal(45), z.literal(60)]),
  type: z.string().min(1, "Tipo de atendimento é obrigatório"),
  status: z.string().min(1, "Status é obrigatório"),
  notes: z.string().optional(),
  isBlocked: z.boolean().optional(),
}).refine((data) => data.isBlocked || (data.patientName && data.patientName.trim().length > 0), {
  message: "Nome do paciente é obrigatório",
  path: ["patientName"],
});

export function useAgendaCreateForm(selectedDate: Date, open: boolean, appointmentToEdit?: AgendaCreateInput | null) {
  const defaultDate = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);

  const initialForm: AgendaCreateInput = useMemo(() => {
    if (appointmentToEdit) {
      return appointmentToEdit;
    }
    return {
      patientName: "",
      date: defaultDate,
      time: "",
      duration: 30,
      type: "Consulta",
      status: "Pendente",
      notes: "",
      isBlocked: false,
    };
  }, [appointmentToEdit, defaultDate]);

  const [form, setForm] = useState<AgendaCreateInput>(initialForm);

  useEffect(() => {
    if (open) {
      setForm(initialForm);
    }
  }, [initialForm, open]);

  const updateField = <K extends keyof AgendaCreateInput>(
    field: K,
    value: AgendaCreateInput[K]
  ) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      
      // Se estiver bloqueando, limpa o nome do paciente
      if (field === "isBlocked" && value === true) {
        next.patientName = "";
      }
      
      return next;
    });
  };

  const isInvalid = useMemo(() => {
    const result = agendaCreateSchema.safeParse(form);
    return !result.success;
  }, [form]);

  return {
    form,
    updateField,
    isInvalid,
  };
}
