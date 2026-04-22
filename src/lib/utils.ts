import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function checkOverlap(
  newApp: { date: string; time: string; duration: number },
  appointments: { date: string; time: string; duration: number }[]
) {
  const newStart = new Date(`${newApp.date}T${newApp.time}:00`).getTime();
  const newEnd = newStart + newApp.duration * 60 * 1000;

  return appointments.some((app) => {
    if (app.date !== newApp.date) return false;

    const appStart = new Date(`${app.date}T${app.time}:00`).getTime();
    const appEnd = appStart + app.duration * 60 * 1000;

    return (
      (newStart >= appStart && newStart < appEnd) ||
      (newEnd > appStart && newEnd <= appEnd) ||
      (newStart <= appStart && newEnd >= appEnd)
    );
  });
}
