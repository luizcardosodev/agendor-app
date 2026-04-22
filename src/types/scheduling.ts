export type AppointmentStatus =
  | "Confirmado"
  | "Pendente"
  | "Cancelado"
  | "Concluído";

export type AppointmentType =
  | "Consulta"
  | "Retorno"
  | "Exame"
  | "Teleconsulta";

export type ViewMode = "month" | "week" | "day";

export interface Professional {
  id: string;
  name: string;
  email: string;
  crm: string;
  specialty: string;
}

export interface Appointment {
  id: string;
  professionalId: string;
  patientName: string;
  patientAvatar?: string;
  date: string;
  time: string;
  duration: 15 | 30 | 45 | 60;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
}

export interface AppointmentFilters {
  status: "Todos" | AppointmentStatus;
  type: "Todos" | AppointmentType;
}

export interface NewAppointmentInput {
  patientName: string;
  date: string;
  time: string;
  duration: 15 | 30 | 45 | 60;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
}
