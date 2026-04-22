import { addDays, addHours, format, parseISO, setHours, setMinutes, startOfMonth } from "date-fns";

import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  Professional,
} from "@/types/scheduling";

export const specialtyOptions = [
  "Cardiologia",
  "Psicologia",
  "Clínica Geral",
  "Ortopedia",
  "Pediatria",
  "Dermatologia",
] as const;

export const mockProfessional: Professional = {
  id: "prof-ana-silva",
  name: "Dra. Ana Silva",
  email: "ana@agendamed.com",
  crm: "CRM 123456-SP",
  specialty: "Cardiologia",
};

export const patientPool = [
  "Mariana Costa",
  "Carlos Eduardo Souza",
  "Fernanda Lima",
  "Paulo Henrique Alves",
  "Juliana Martins",
  "Ricardo Gomes",
  "Beatriz Carvalho",
  "Lucas Nascimento",
  "Camila Azevedo",
  "Gabriel Pereira",
  "Patrícia Rocha",
  "Rafael Moreira",
  "Larissa Barros",
  "João Vitor Oliveira",
  "Vanessa Ribeiro",
  "Felipe Andrade",
  "Tatiane Lopes",
  "Bruno Fernandes",
  "Aline Moura",
  "Renata Faria",
  "Thiago Cunha",
  "Carolina Melo",
];

const appointmentTypes: AppointmentType[] = [
  "Consulta",
  "Retorno",
  "Exame",
  "Teleconsulta",
];

const appointmentStatuses: AppointmentStatus[] = [
  "Confirmado",
  "Pendente",
  "Concluído",
  "Cancelado",
];

const durations: Array<15 | 30 | 45 | 60> = [30, 45, 60, 30, 15];
const timeSlots = ["08:00", "09:30", "10:30", "11:30", "13:30", "15:00", "16:30", "18:00"];
const dayOffsets = [0, 1, 2, 3, 4, 7, 8, 9, 11, 13, 15, 17, 18, 20, 22, 23, 24, 26, 27, 28];

export const mockAppointments: Appointment[] = dayOffsets.map((offset, index) => {
  const currentMonth = startOfMonth(new Date());
  const date = addDays(currentMonth, offset);
  const status = appointmentStatuses[index % appointmentStatuses.length];

  return {
    id: `apt-${index + 1}`,
    professionalId: mockProfessional.id,
    patientName: patientPool[index % patientPool.length],
    date: format(date, "yyyy-MM-dd"),
    time: timeSlots[index % timeSlots.length],
    duration: durations[index % durations.length],
    type: appointmentTypes[index % appointmentTypes.length],
    status,
    notes:
      status === "Pendente"
        ? "Aguardando confirmação da paciente."
        : "Paciente orientado a manter acompanhamento regular.",
  };
});

export const quickCreateSlots = Array.from({ length: 25 }, (_, index) => {
  const base = addHours(setMinutes(setHours(new Date(), 8), 0), index / 2);
  return format(base, "HH:mm");
});
