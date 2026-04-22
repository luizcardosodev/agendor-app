import { addDays, addMinutes, addWeeks, format, parseISO, startOfWeek } from "date-fns";

import type { Appointment, AppointmentStatus, AppointmentType } from "@/types/scheduling";

export type ScheduleAccent = "sky" | "violet" | "teal" | "green" | "rose" | "slate";

export interface ScheduleAppointment extends Appointment {
  accent: ScheduleAccent;
  stageLabel: string;
  detailLabel: string;
  online?: boolean;
  archived?: boolean;
  expired?: boolean;
  isBlocked?: boolean;
}

interface ScheduleAppointmentSeed {
  offset: number;
  time: string;
  duration: 15 | 30 | 45 | 60;
  patientName: string;
  type: AppointmentType;
  status: AppointmentStatus;
  accent: ScheduleAccent;
  stageLabel: string;
  detailLabel: string;
  online?: boolean;
  archived?: boolean;
  expired?: boolean;
  notes?: string;
}

const currentWeekSeeds: ScheduleAppointmentSeed[] = [
  {
    offset: 0,
    time: "09:00",
    duration: 30,
    patientName: "Matthew Lambert",
    type: "Consulta",
    status: "Concluído",
    accent: "sky",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta BC",
  },
  {
    offset: 0,
    time: "09:30",
    duration: 30,
    patientName: "Nicole Ribeiro Correia",
    type: "Consulta",
    status: "Concluído",
    accent: "sky",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta",
  },
  {
    offset: 0,
    time: "11:00",
    duration: 30,
    patientName: "Laura Barros Ribeiro",
    type: "Consulta",
    status: "Concluído",
    accent: "sky",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta BC",
  },
  {
    offset: 0,
    time: "11:30",
    duration: 30,
    patientName: "Diogo Santos Dias",
    type: "Consulta",
    status: "Concluído",
    accent: "sky",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta BC",
  },
  {
    offset: 1,
    time: "09:00",
    duration: 30,
    patientName: "Nader Ran",
    type: "Retorno",
    status: "Concluído",
    accent: "violet",
    stageLabel: "Paciente atendido",
    detailLabel: "Retorno",
  },
  {
    offset: 1,
    time: "09:30",
    duration: 30,
    patientName: "Kevin P. Ham",
    type: "Consulta",
    status: "Concluído",
    accent: "sky",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta",
  },
  {
    offset: 1,
    time: "10:00",
    duration: 30,
    patientName: "Lívia Andrade Lima",
    type: "Consulta",
    status: "Concluído",
    accent: "sky",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta BC",
  },
  {
    offset: 1,
    time: "10:30",
    duration: 30,
    patientName: "Samuel Melo Castro",
    type: "Consulta",
    status: "Concluído",
    accent: "sky",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta BC",
  },
  {
    offset: 1,
    time: "11:30",
    duration: 30,
    patientName: "Clara Rocha Gonçalves",
    type: "Consulta",
    status: "Concluído",
    accent: "sky",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta",
  },
  {
    offset: 2,
    time: "08:00",
    duration: 30,
    patientName: "Gabriel Bishop Souza",
    type: "Consulta",
    status: "Concluído",
    accent: "sky",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta",
  },
  {
    offset: 2,
    time: "09:00",
    duration: 60,
    patientName: "Battista Davide",
    type: "Retorno",
    status: "Concluído",
    accent: "violet",
    stageLabel: "Paciente atendido",
    detailLabel: "Retorno",
  },
  {
    offset: 2,
    time: "10:00",
    duration: 30,
    patientName: "Silvia Mendonça",
    type: "Consulta",
    status: "Concluído",
    accent: "sky",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta BC",
  },
  {
    offset: 2,
    time: "11:30",
    duration: 30,
    patientName: "Irene Bergamaschi",
    type: "Consulta",
    status: "Concluído",
    accent: "teal",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta",
  },
  {
    offset: 3,
    time: "08:00",
    duration: 30,
    patientName: "Flávio Camargo Vieira",
    type: "Consulta",
    status: "Concluído",
    accent: "sky",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta BC",
  },
  {
    offset: 3,
    time: "09:30",
    duration: 60,
    patientName: "Sofia Barbosa",
    type: "Consulta",
    status: "Concluído",
    accent: "sky",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta BC",
  },
  {
    offset: 3,
    time: "10:30",
    duration: 30,
    patientName: "Manuela Barese",
    type: "Consulta",
    status: "Concluído",
    accent: "teal",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta",
  },
  {
    offset: 3,
    time: "11:30",
    duration: 30,
    patientName: "Domenico Indrizzi",
    type: "Exame",
    status: "Concluído",
    accent: "green",
    stageLabel: "Paciente atendido",
    detailLabel: "Exame",
  },
  {
    offset: 4,
    time: "09:30",
    duration: 30,
    patientName: "Ricardo Assis",
    type: "Consulta",
    status: "Concluído",
    accent: "sky",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta",
  },
  {
    offset: 4,
    time: "10:00",
    duration: 30,
    patientName: "Ricardo Silva Lima",
    type: "Consulta",
    status: "Concluído",
    accent: "sky",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta BC",
  },
  {
    offset: 4,
    time: "10:30",
    duration: 30,
    patientName: "Sofia Barbosa",
    type: "Consulta",
    status: "Concluído",
    accent: "sky",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta BC",
  },

  {
    offset: 4,
    time: "11:30",
    duration: 30,
    patientName: "Roberto Antunes",
    type: "Exame",
    status: "Concluído",
    accent: "rose",
    stageLabel: "Paciente atendido",
    detailLabel: "Teste",
  },
  {
    offset: 6,
    time: "09:00",
    duration: 30,
    patientName: "Camila Azevedo",
    type: "Consulta",
    status: "Concluído",
    accent: "sky",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta",
  },
  {
    offset: 6,
    time: "10:30",
    duration: 45,
    patientName: "Juliana Martins",
    type: "Consulta",
    status: "Concluído",
    accent: "teal",
    stageLabel: "Paciente atendido",
    detailLabel: "Consulta",
  },
  {
    offset: 0,
    time: "14:00",
    duration: 30,
    patientName: "Bruno Fernandes",
    type: "Consulta",
    status: "Cancelado",
    accent: "slate",
    stageLabel: "Paciente cancelado",
    detailLabel: "Consulta",
  },
  {
    offset: 6,
    time: "16:00",
    duration: 30,
    patientName: "Vanessa Ribeiro",
    type: "Teleconsulta",
    status: "Concluído",
    accent: "teal",
    stageLabel: "Horário online",
    detailLabel: "Teleconsulta",
    online: true,
  },
  {
    offset: 2,
    time: "16:00",
    duration: 30,
    patientName: "Rafael Moreira",
    type: "Consulta",
    status: "Concluído",
    accent: "slate",
    stageLabel: "Arquivado",
    detailLabel: "Consulta",
    archived: true,
  },
];

const nextWeekSeeds: ScheduleAppointmentSeed[] = [...currentWeekSeeds];

function buildAppointment(
  idPrefix: string,
  weekStart: Date,
  seed: ScheduleAppointmentSeed,
  index: number,
): ScheduleAppointment {
  const date = addDays(weekStart, seed.offset);

  return {
    id: `${idPrefix}-${index + 1}`,
    professionalId: "prof-ana-silva",
    patientName: seed.patientName,
    date: format(date, "yyyy-MM-dd"),
    time: seed.time,
    duration: seed.duration,
    type: seed.type,
    status: seed.status,
    notes:
      seed.notes ??
      (seed.status === "Confirmado"
        ? "Paciente com confirmação enviada por WhatsApp."
        : "Confirmar informações clínicas na chegada."),
    accent: seed.accent,
    stageLabel: seed.stageLabel,
    detailLabel: seed.detailLabel,
    online: seed.online,
    archived: seed.archived,
    expired: seed.expired,
  };
}

export function createWeeklyAgendaAppointments(anchorDate = new Date()) {
  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 });
  const nextWeekStart = addWeeks(weekStart, 1);
  const prevWeekStart = addWeeks(weekStart, -1);
  const prevMonthStart = addWeeks(weekStart, -4);

  let nameIndex = 0;
  
  const getNextUniqueName = () => {
    const firstNames = ["Ana", "Bruno", "Carlos", "Daniela", "Eduardo", "Fernanda", "Gabriel", "Helena", "Igor", "Juliana", "Lucas", "Mariana", "Nicolas", "Olivia", "Pedro", "Quintino", "Rafael", "Sofia", "Tiago", "Ursula", "Vitor", "Wanessa", "Xavier", "Yara", "Zeca"];
    const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha", "Dias", "Nascimento", "Andrade", "Moreira", "Nunes"];
    const fName = firstNames[nameIndex % firstNames.length];
    const lName = lastNames[Math.floor(nameIndex / firstNames.length) % lastNames.length];
    nameIndex++;
    return `${fName} ${lName}`;
  };

  const mapWithUniqueName = (prefix: string, date: Date, seeds: ScheduleAppointmentSeed[]) => {
    return seeds.map((seed, index) => {
      const uniqueSeed = { ...seed, patientName: getNextUniqueName() };
      return buildAppointment(prefix, date, uniqueSeed, index);
    });
  };

  return [
    ...mapWithUniqueName("week-prev-month", prevMonthStart, currentWeekSeeds),
    ...mapWithUniqueName("week-prev", prevWeekStart, currentWeekSeeds),
    ...mapWithUniqueName("week-current", weekStart, currentWeekSeeds),
    ...mapWithUniqueName("week-next", nextWeekStart, nextWeekSeeds),
  ];
}

export function getAppointmentStatusClasses(status: AppointmentStatus) {
  switch (status) {
    case "Confirmado":
      return "border-green-200 bg-green-100 text-green-800";
    case "Pendente":
      return "border-purple-200 bg-purple-100 text-purple-800";
    case "Cancelado":
      return "border-red-200 bg-red-100 text-red-800";
    case "Concluído":
      return "border-blue-200 bg-blue-100 text-blue-800";
    default:
      return "border-slate-200 bg-slate-100 text-slate-800";
  }
}

export function getAppointmentEndTime(date: string, time: string, duration: number) {
  const [hours, minutes] = time.split(":").map(Number);
  const start = addMinutes(parseISO(date), hours * 60 + minutes);
  return format(addMinutes(start, duration), "HH:mm");
}
