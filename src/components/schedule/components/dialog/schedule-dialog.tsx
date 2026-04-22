"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAgendaCreateForm } from "@/components/schedule/hooks/useAgendaCreateForm";
import type { AgendaCreateInput } from "@/components/schedule/hooks/useAgenda";
import type { AppointmentStatus, AppointmentType } from "@/types/scheduling";
import { useAttachmentStore } from "@/components/schedule/store/attachment-store";
import { PatientSelection } from "./patient-selection";
import { DateTimeSelection } from "./date-time-selection";
import { cn, checkOverlap } from "@/lib/utils";
import {
  CalendarDays,
  Clock,
  User,
  Tag,
  FileText,
  CalendarPlus,
  CalendarClock,
  X,
  Check,
  ShieldAlert,
  Upload,
  Paperclip,
  Trash2,
  File as FileIcon,
  Download
} from "lucide-react";
import { Switch } from "@/components/ui/switch";



const durations: Array<15 | 30 | 45 | 60> = [15, 30, 45, 60];
const appointmentTypes: AppointmentType[] = ["Consulta", "Retorno", "Exame", "Teleconsulta"];
const appointmentStatuses: AppointmentStatus[] = ["Pendente", "Confirmado", "Concluído", "Cancelado"];


export function ScheduleDialog({
  open,
  patientSuggestions,
  selectedDate,
  onClose,
  onCreate,
  appointmentToEdit,
  appointments,
  startHour,
  endHour,
}: {
  open: boolean;
  patientSuggestions: string[];
  selectedDate: Date;
  onClose: () => void;
  onCreate: (input: AgendaCreateInput) => void;
  appointmentToEdit?: AgendaCreateInput | null;
  appointments: any[];
  startHour: number;
  endHour: number;
}) {
  const { form, updateField, isInvalid } = useAgendaCreateForm(selectedDate, open, appointmentToEdit);
  const { attachedFiles, loadAttachments, addAttachment, removeAttachment, clearAttachments, isLoading, persistAttachments } = useAttachmentStore();
  const [isDragging, setIsDragging] = useState(false);
  const [currentId, setCurrentId] = useState<string>("");

  useEffect(() => {
    if (open) {
      const id = (appointmentToEdit as any)?.id || `temp-${crypto.randomUUID()}`;
      setCurrentId(id);
      loadAttachments(id);
    } else {
      clearAttachments();
      setIsDragging(false);
      setCurrentId("");
    }
  }, [open, appointmentToEdit, loadAttachments, clearAttachments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      for (const file of filesArray) {
        addAttachment(file);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      for (const file of filesArray) {
        addAttachment(file);
      }
    }
  };

  const handleRemoveFile = (file: File) => {
    removeAttachment(file);
  };

  const handleDownloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (currentId) {
      await persistAttachments(currentId);
      onCreate({ ...form, id: currentId } as any);
    }
  };

  const availableTimeOptions = useMemo(() => {
    // Gera a lista base de horários respeitando a hora inicial e final das configurações
    const dynamicTimeOptions = [];
    let currentMinutes = startHour * 60;
    const limitMinutes = endHour * 60;

    while (currentMinutes + form.duration <= limitMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      dynamicTimeOptions.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      currentMinutes += form.duration;
    }

    if (appointmentToEdit && appointmentToEdit.time && form.date === appointmentToEdit.date) {
      if (!dynamicTimeOptions.includes(appointmentToEdit.time)) {
        dynamicTimeOptions.push(appointmentToEdit.time);
        dynamicTimeOptions.sort();
      }
    }

    return dynamicTimeOptions.filter(time => {
      // Se estiver editando e for o horário original, mantemos na lista
      const isOriginalTime = appointmentToEdit && time === appointmentToEdit.time && form.date === appointmentToEdit.date;
      if (isOriginalTime) return true;

      const input = {
        date: form.date,
        time: time,
        duration: form.duration
      };

      const otherAppointments = appointments.filter(a => a.id !== (appointmentToEdit as any)?.id);
      return !checkOverlap(input, otherAppointments);
    });
  }, [form.date, form.duration, appointments, appointmentToEdit, open, startHour, endHour]);

  // Sempre que a lista de horários mudar (por troca de duração ou data), 
  // verifica se o horário selecionado ainda é válido. Se não for, reseta.
  useEffect(() => {
    if (form.time && !availableTimeOptions.includes(form.time)) {
      updateField("time", "");
    }
  }, [availableTimeOptions, form.time, updateField]);

  if (!open) {
    return null;
  }

  const isEditing = !!appointmentToEdit && !!(appointmentToEdit as any).id;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-2xl border-none bg-white/95 p-0 shadow-2xl backdrop-blur-xl">
        <DialogHeader className="relative overflow-hidden border-b border-[#E6EEFB] px-8 py-8">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-black-50/50 blur-3xl" />
          <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-indigo-50/30 blur-3xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black shadow-lg shadow-black-200">
              {isEditing ? (
                <CalendarClock className="h-6 w-6 text-white" />
              ) : (
                <CalendarPlus className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-black-600/70">
                {isEditing ? "Agenda" : "Agenda"}
              </DialogDescription>
              <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">
                {isEditing ? "Editar agendamento" : " Novo agendamento"}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div
          className="space-y-8 px-8 py-8  overflow-y-auto"
        >
          {!form.isBlocked && (
            <div className="space-y-8">
              {/* Seção Paciente */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <Label>Informações do Paciente</Label>
                </div>
                <PatientSelection
                  onChange={(value) => updateField("patientName", value)}
                  patientName={form.patientName}
                  patientSuggestions={patientSuggestions}
                />
              </section>

              {/* Seção Classificação */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-400" />
                  <Label>Classificação do Atendimento</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tipo de Atendimento</Label>
                    <div className="bg-white">
                      <Select
                        onValueChange={(value) => updateField("type", value as AppointmentType)}
                        value={form.type}
                      >
                        <SelectTrigger className="h-11 w-full border-slate-200 bg-slate-50/50">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {appointmentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Status</Label>
                    <div className="bg-white">
                      <Select
                        onValueChange={(value) => updateField("status", value as AppointmentStatus)}
                        value={form.status}
                      >
                        <SelectTrigger className="h-11 w-full border-slate-200 bg-slate-50/50">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {appointmentStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Bloqueio de Horário Slider */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white">
                <ShieldAlert className="h-4 w-4 text-slate-500" />
              </div>
              <div className="flex flex-col">
                <Label className="text-sm font-semibold">Bloquear Horário</Label>
                <span className="text-[10px] text-slate-500">Impede agendamentos na data e horário definidos abaixo.</span>
              </div>
            </div>
            <Switch
              checked={form.isBlocked}
              onCheckedChange={(checked) => {
                updateField("isBlocked", checked);
                if (checked) {
                  updateField("patientName", "");
                  updateField("type", "Consulta");
                  updateField("status", "Pendente");
                  updateField("notes", "");
                }
              }}
            />
          </div>

          {/* Duração e Agendamento Lado a Lado */}
          <div className="grid grid-cols-2 gap-8">
            {/* Seção Detalhes (Duração) */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <Label>Duração do Atendimento</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {durations.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => updateField("duration", duration)}
                    type="button"
                    className={`
                      relative flex h-11 items-center justify-center rounded-xl border text-sm font-medium transition-all duration-200
                      ${form.duration === duration
                        ? "border-black-600 bg-black-50 text-black-700 shadow-sm"
                        : "border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200 hover:bg-slate-100"}
                    `}
                  >
                    {duration} min
                    {form.duration === duration && (
                      <div
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-white shadow-sm"
                      >
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Seção Data e Horário */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <Label>Agendamento</Label>
              </div>
              <DateTimeSelection
                date={form.date}
                onDateChange={(value) => updateField("date", value)}
                onTimeChange={(value) => updateField("time", value)}
                time={form.time}
                timeOptions={availableTimeOptions}
              />
            </section>
          </div>

          {/* Anexo e Observações Lado a Lado */}
          <div className="grid grid-cols-2 gap-8">

            {/* Seção Notas */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <Label>Observações</Label>
              </div>
              <Textarea
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Observações importantes..."
                className="h-[120px] resize-none border-slate-200 bg-slate-50/50 p-4 transition-all focus:bg-white"
                value={form.notes}
              />
            </section>

            {/* Seção Anexo */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <Label>Anexar Documentos</Label>
              </div>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
                className={cn(
                  "group relative flex h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all",
                  isDragging 
                    ? "border-black-600 bg-black-50/50" 
                    : "border-slate-200 bg-slate-50/50 hover:border-black-400 hover:bg-white"
                )}
              >
                {attachedFiles.length > 0 ? (
                  <div className="flex w-full flex-col gap-2 overflow-y-auto px-4 py-2 calendar-scrollbar" onClick={(e) => e.stopPropagation()}>
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-100">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileIcon className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate text-[10px] font-medium text-slate-600">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDownloadFile(file); }}
                            type="button"
                            className="rounded p-1 hover:bg-slate-100 hover:text-black-600 transition-colors"
                            title="Baixar arquivo"
                          >
                            <Download className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRemoveFile(file); }}
                            type="button"
                            className="rounded p-1 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Remover arquivo"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={(e) => { e.stopPropagation(); document.getElementById('file-input')?.click(); }}
                      type="button"
                      className="text-center text-[10px] font-bold text-black-600 hover:underline mt-1"
                    >
                      + Adicionar mais
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition-all group-hover:scale-110 group-hover:ring-black-400">
                      <Upload className="h-4 w-4 text-slate-400 group-hover:text-black-600" />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium text-slate-700">Clique ou arraste arquivos</p>
                      <p className="text-[10px] text-slate-500">PDF, JPG, PNG (máx. 10MB)</p>
                    </div>
                  </>
                )}
                <input 
                  id="file-input"
                  type="file" 
                  className="hidden" 
                  multiple 
                  onChange={handleFileChange}
                />
              </div>
            </section>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-8 py-6">
          <Button
            onClick={onClose}
            type="button"
            variant="ghost"
            className="w-full sm:w-auto h-11 px-6 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            disabled={isInvalid}
            onClick={handleSave}
            type="button"
            className="w-full sm:w-auto h-11 bg-black px-8 font-semibold text-white shadow-lg shadow-black/20 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isEditing ? (
              <>
                <CalendarClock className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Confirmar Agendamento
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
