import type { AppointmentStatus, AppointmentType } from "@/types/scheduling";

export function getStatusClasses(status: AppointmentStatus) {
  switch (status) {
    case "Confirmado":
      return "border-transparent bg-teal-600/12 text-teal-700";
    case "Pendente":
      return "border-transparent bg-amber-500/14 text-amber-700";
    case "Cancelado":
      return "border-transparent bg-rose-500/10 text-rose-600";
    case "Concluído":
      return "border-transparent bg-slate-500/10 text-slate-600";
  }
}

export function getStatusStripe(status: AppointmentStatus) {
  switch (status) {
    case "Confirmado":
      return "bg-teal-600";
    case "Pendente":
      return "bg-amber-500";
    case "Cancelado":
      return "bg-rose-500";
    case "Concluído":
      return "bg-slate-400";
  }
}

export function getTypeClasses(type: AppointmentType) {
  switch (type) {
    case "Consulta":
      return "bg-sky-100 text-sky-700";
    case "Retorno":
      return "bg-indigo-100 text-indigo-700";
    case "Exame":
      return "bg-fuchsia-100 text-fuchsia-700";
    case "Teleconsulta":
      return "bg-emerald-100 text-emerald-700";
  }
}
