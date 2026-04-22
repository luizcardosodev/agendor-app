"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  startHour: number;
  endHour: number;
  setStartHour: (hour: number) => void;
  setEndHour: (hour: number) => void;
  defaultDuration: number;
  setDefaultDuration: (duration: number) => void;
  hideWeekends: boolean;
  setHideWeekends: (hide: boolean) => void;
}

export function SettingsSidebar({
  isOpen,
  onClose,
  startHour,
  endHour,
  setStartHour,
  setEndHour,
  defaultDuration,
  setDefaultDuration,
  hideWeekends,
  setHideWeekends,
}: SettingsSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay for mobile/desktop to close when clicking outside */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 backdrop-blur-[2px] z-[60]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 h-full w-full max-w-[400px] z-[70] bg-[var(--surface)] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Configurações da Agenda</h3>
              <Button onClick={onClose} size="icon" variant="ghost" className="h-8 w-8 rounded-full text-slate-500 dark:text-gray-400">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 dark:text-gray-200">Duração Padrão do Slot</Label>
                <div className="flex flex-col gap-3">
                  {[15, 30, 45, 60].map((duration) => (
                    <label key={duration} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`relative flex items-center justify-center h-5 w-5 rounded-full border transition-colors ${defaultDuration === duration ? 'border-[var(--primary)]' : 'border-slate-300 dark:border-gray-600 bg-[var(--surface)] group-hover:border-[var(--primary)]'}`}>
                        <input
                          type="radio"
                          name="defaultDuration"
                          checked={defaultDuration === duration}
                          onChange={() => setDefaultDuration(duration)}
                          className="peer absolute opacity-0 w-full h-full cursor-pointer"
                        />
                        <div className={`h-2.5 w-2.5 rounded-full bg-[var(--primary)] ${defaultDuration === duration ? 'block' : 'hidden'}`}></div>
                      </div>
                      <span className={`text-sm font-medium transition-colors ${defaultDuration === duration ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>{duration} minutos</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 dark:text-gray-200">Horário de Funcionamento</Label>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs text-slate-500 dark:text-gray-400">Início</Label>
                    <Select value={startHour.toString()} onValueChange={(v) => setStartHour(Number(v))}>
                      <SelectTrigger className="h-11 rounded-xl bg-[var(--surface)]">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, i) => (
                          <SelectItem key={i} value={i.toString()} disabled={i >= endHour}>
                            {i.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs text-slate-500 dark:text-gray-400">Término</Label>
                    <Select value={endHour.toString()} onValueChange={(v) => setEndHour(Number(v))}>
                      <SelectTrigger className="h-11 rounded-xl bg-[var(--surface)]">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, i) => (
                          <SelectItem key={i} value={i.toString()} disabled={i <= startHour}>
                            {i.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 dark:text-gray-200">Preferências de Visualização</Label>
                <div className="flex flex-col gap-4 pt-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-600 dark:text-gray-400 cursor-pointer">Ocultar finais de semana</Label>
                    <Switch
                      checked={hideWeekends}
                      onCheckedChange={setHideWeekends}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-600 dark:text-gray-400 cursor-pointer">Mostrar horários inativos</Label>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--surface-border)] bg-[var(--surface-muted)] p-6 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={onClose}>Salvar Configurações</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
