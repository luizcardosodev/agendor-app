import * as React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateTimeSelectionProps {
  date: string;
  time: string;
  timeOptions: string[];
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}

export function DateTimeSelection({
  date,
  time,
  timeOptions,
  onDateChange,
  onTimeChange,
}: DateTimeSelectionProps) {
  const selectedDate = date ? parseISO(date) : undefined;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="space-y-1.5 flex flex-col">
        <Label className="text-xs">Data da Consulta</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full"
            >
              <CalendarIcon className="mr-2" />
              {date ? format(selectedDate!, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => onDateChange(date ? format(date, "yyyy-MM-dd") : "")}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-1.5 flex flex-col">
        <Label className="text-xs">Horário</Label>
        <Select onValueChange={onTimeChange} value={time}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um horário" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {timeOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
