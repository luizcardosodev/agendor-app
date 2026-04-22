import {
  ChevronLeft,
  ChevronRight,
  Printer,
  Search,
  Info,
  AlertCircle,
  LayoutGrid,
  Columns,
  LayoutList,
  Filter,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { isToday, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useRef, useEffect } from "react";
import { useAgendaStore } from "@/components/schedule/store/agenda-store";

interface GridControlsProps {
  selectedDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  currentWeekRangeLabel: string;
  defaultDuration: number;
  setDefaultDuration: (duration: number) => void;
  viewType: 'day' | 'week' | 'month';
  onViewChange: (view: 'day' | 'week' | 'month') => void;
  stats: {
    total: number;
    completed: number;
    pending: number;
    scheduled: number;
    cancelled: number;
    hasOverduePending: boolean;
  };
  onToggleFilterSidebar: () => void;
  onToggleSettingsSidebar: () => void;
}

export function GridControls({
  selectedDate,
  onPrevious,
  onNext,
  onToday,
  currentWeekRangeLabel,
  defaultDuration,
  setDefaultDuration,
  viewType,
  onViewChange,
  stats,
  onToggleFilterSidebar,
  onToggleSettingsSidebar,
}: GridControlsProps) {
  const durations = [15, 30, 45, 60];

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { appointments, setSelectedDate, setHighlightedAppointmentId } = useAgendaStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex flex-col gap-4 border-b border-[var(--surface-soft)] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3 lg:w-1/3">
          <Button onClick={onPrevious} size="icon" type="button" variant="ghost" className="cursor-pointer">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            className={cn(
              "h-11 rounded-2xl px-5 shadow-none transition-colors hover:translate-y-0 cursor-pointer",
              isToday(selectedDate)
                ? "bg-[var(--primary)] text-white hover:bg-[#1a2e4d]"
                : "border-[var(--surface-soft)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--background)]"
            )}
            onClick={onToday}
            type="button"
            variant={isToday(selectedDate) ? "default" : "secondary"}
          >
            Hoje
          </Button>
          <Button onClick={onNext} size="icon" type="button" variant="ghost" className="cursor-pointer">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 lg:w-1/3">
          <div className="relative hidden min-w-[350px] lg:block z-50" ref={searchRef}>
            <Command>
              <div className="relative">
                <CommandInput
                  placeholder="Buscar por nome do paciente"
                  value={searchTerm}
                  onValueChange={(val) => {
                    setSearchTerm(val);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                />
              </div>

              {isSearchOpen && searchTerm && (
                <div className="absolute top-full w-full bg-[var(--surface)] rounded-2xl shadow-lg border border-[var(--surface-border)] z-50">
                  <CommandList>
                    <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                    <CommandGroup>
                      {appointments
                        .map(app => (
                          <CommandItem
                            key={app.id}
                            value={`${app.patientName} ${format(parseISO(app.date), "dd/MM/yyyy")}`}
                            onSelect={() => {
                              setSelectedDate(parseISO(app.date));
                              setSearchTerm("");
                              setIsSearchOpen(false);
                              setHighlightedAppointmentId(app.id);
                              setTimeout(() => {
                                setHighlightedAppointmentId(null);
                              }, 3000);
                            }}
                            className="cursor-pointer"
                          >
                            <span className="font-medium text-slate-900 dark:text-white">{app.patientName}</span>
                            <span className="text-xs text-slate-500 dark:text-gray-400">
                              {format(parseISO(app.date), "dd/MM/yyyy", { locale: ptBR })} às {app.time}
                            </span>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </div>
              )}
            </Command>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 lg:w-1/3">
          <div className="flex items-center gap-1 rounded-2xl border border-[var(--surface-border)] p-1">
            <Button
              className={cn(
                "h-9 rounded-xl px-3 shadow-none cursor-pointer",
                viewType === 'day' ? "bg-[var(--surface)] shadow-sm text-[var(--primary)]" : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
              )}
              onClick={() => onViewChange('day')}
              size="sm"
              variant="ghost"
              title="Dia"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              className={cn(
                "h-9 rounded-xl px-3 shadow-none cursor-pointer",
                viewType === 'week' ? "bg-[var(--surface)] shadow-sm text-[var(--primary)]" : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
              )}
              onClick={() => onViewChange('week')}
              size="sm"
              variant="ghost"
              title="Semana"
            >
              <Columns className="h-4 w-4" />
            </Button>
            <Button
              className={cn(
                "h-9 rounded-xl px-3 shadow-none cursor-pointer",
                viewType === 'month' ? "bg-[var(--surface)] shadow-sm text-[var(--primary)]" : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
              )}
              onClick={() => onViewChange('month')}
              size="sm"
              variant="ghost"
              title="Mês"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button className="h-11 w-11 rounded-2xl cursor-pointer" size="icon" type="button" variant="ghost">
            <Printer className="h-4 w-4 text-slate-500 dark:text-gray-400" />
          </Button>

          {/* <Button
            className="h-11 w-11 rounded-2xl cursor-pointer"
            size="icon"
            type="button"
            variant="ghost"
            onClick={onToggleSettingsSidebar}
          >
            <Settings className="h-4 w-4 text-slate-500 dark:text-gray-400" />
          </Button> */}

          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "h-11 w-11 rounded-2xl relative data-[state=open]:bg-[var(--surface-soft)] cursor-pointer"
                )}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Info className="h-4 w-4 text-slate-500 dark:text-gray-400" />
                {stats.hasOverduePending && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-4 rounded-[2rem]">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Resumo da Agenda</h4>
                  <div className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase">
                    {viewType === 'day' ? 'Diário' : viewType === 'month' ? 'Mensal' : 'Semanal'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[var(--surface-muted)] p-3 col-span-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">Total</div>
                    <div className="mt-1 text-xl font-bold text-slate-700 dark:text-white">{stats.total}</div>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600/70">Concluídos</div>
                    <div className="mt-1 text-xl font-bold text-blue-700">{stats.completed}</div>
                  </div>
                  <div className="rounded-2xl bg-green-50 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-green-600/70">Confirmados</div>
                    <div className="mt-1 text-xl font-bold text-green-700">{stats.scheduled}</div>
                  </div>
                  <div className="rounded-2xl bg-purple-50 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600/70">Pendentes</div>
                    <div className="mt-1 text-xl font-bold text-purple-700">{stats.pending}</div>
                  </div>
                  <div className="rounded-2xl bg-red-50 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-red-600/70">Cancelados</div>
                    <div className="mt-1 text-xl font-bold text-red-700">{stats.cancelled}</div>
                  </div>
                </div>

                {stats.hasOverduePending && (
                  <div className="flex gap-3 rounded-2xl bg-red-50 p-3 border border-red-100">
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                    <div className="text-xs text-red-700 leading-normal">
                      <span className="font-bold block">Atenção!</span>
                      Existem agendamentos que não foram concluídos expirados.
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="border-b border-[var(--surface-soft)] px-6 py-3 text-sm font-medium text-slate-400 dark:text-gray-500">
        {currentWeekRangeLabel}
      </div>
    </div>
  );
}

