"use client";

import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import { Check, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgendaStore } from "@/components/schedule/store/agenda-store";
import { getAppointmentStatusClasses, type ScheduleAppointment } from "@/components/schedule/lib/schedule-mock";
import { AppointmentCardContent } from "./appointment-card-content";

interface AppointmentCardProps {
  appointment: ScheduleAppointment;
  index: number;
  style: React.CSSProperties;
  isPast: boolean;
  isOverdue?: boolean;
  isCurrentDay: boolean;
  onClick: (id: string) => void;
  getAppointmentEndTime: (date: string, time: string, duration: number) => string;
  defaultDuration?: number;
  slotHeight?: number;
}

export function AppointmentCard({
  appointment,
  index,
  style,
  isPast,
  isOverdue,
  isCurrentDay,
  onClick,
  getAppointmentEndTime,
  defaultDuration = 15,
  slotHeight = 54,
}: AppointmentCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: appointment.id,
    data: appointment,
  });

  const dndStyle = transform
    ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    }
    : undefined;

  const updateAppointmentDuration = useAgendaStore((state) => state.updateAppointmentDuration);
  const updateAppointmentStatus = useAgendaStore((state) => state.updateAppointmentStatus);
  const highlightedAppointmentId = useAgendaStore((state) => state.highlightedAppointmentId);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDelta, setResizeDelta] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    if (highlightedAppointmentId === appointment.id) {
      const el = document.getElementById(`appointment-${appointment.id}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [highlightedAppointmentId, appointment.id]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleCloseOthers = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener("click", handleClick);
      window.addEventListener("close-context-menus", handleCloseOthers);
    }
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("close-context-menus", handleCloseOthers);
    };
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event("close-context-menus"));
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const startY = e.clientY;
    setIsResizing(true);
    
    let maxDuration = Infinity;
    const sameDayApps = useAgendaStore.getState().appointments.filter(
      (a) => a.date === appointment.date && a.id !== appointment.id && a.status !== "Cancelado"
    );
    for (const a of sameDayApps) {
      if (a.time >= appointment.time) {
        const [aHours, aMins] = a.time.split(":").map(Number);
        const [currHours, currMins] = appointment.time.split(":").map(Number);
        const diff = (aHours * 60 + aMins) - (currHours * 60 + currMins);
        if (diff < maxDuration) {
          maxDuration = diff;
        }
      }
    }

    const onPointerMove = (moveEvent: PointerEvent) => {
      let deltaY = moveEvent.clientY - startY;
      const pxPerMin = slotHeight / defaultDuration;
      const maxHeightDelta = (maxDuration - appointment.duration) * pxPerMin;
      if (deltaY > maxHeightDelta) {
        deltaY = maxHeightDelta;
      }
      setResizeDelta(deltaY);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      let finalDeltaY = upEvent.clientY - startY;
      const pxPerMin = slotHeight / defaultDuration;
      const maxHeightDelta = (maxDuration - appointment.duration) * pxPerMin;
      if (finalDeltaY > maxHeightDelta) {
        finalDeltaY = maxHeightDelta;
      }

      const deltaMinutes = finalDeltaY / pxPerMin;
      const newDuration = Math.max(15, appointment.duration + deltaMinutes);
      
      let snappedDuration = Math.round(newDuration / 15) * 15;
      
      if (snappedDuration > maxDuration) {
        snappedDuration = Math.floor(maxDuration / 15) * 15;
      }
      
      const finalDuration = Math.max(15, snappedDuration);
      
      updateAppointmentDuration(appointment.id, finalDuration as 15 | 30 | 45 | 60);
      setResizeDelta(0);
      
      // Delay reset of isResizing so that the onClick handler can catch it
      setTimeout(() => {
        setIsResizing(false);
      }, 100);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const currentHeight = (typeof style.height === 'number' ? style.height : 0) + resizeDelta;
  const finalStyle = isResizing ? { ...style, height: Math.max(currentHeight, slotHeight / (defaultDuration / 15)) } : style;

  return (
    <motion.button
      id={`appointment-${appointment.id}`}
      ref={setNodeRef}
      animate={{ 
        opacity: isDragging ? 0.3 : highlightedAppointmentId === appointment.id ? [1, 0.4, 1, 0.4, 1, 0.4, 1] : 1, 
        scale: 1, 
        y: 0 
      }}
      className={cn(
        "group flex flex-col justify-start pointer-events-auto absolute left-2 right-2 overflow-hidden rounded-[6px] border px-3 py-2 text-left transition hover:z-20",
        getAppointmentStatusClasses(appointment.status),
        isPast
          ? "opacity-40 saturate-[0.5] grayscale-[0.4] transition-all duration-500 hover:opacity-60"
          : "opacity-100 saturate-[1.25] ring-2 ring-white/50 z-10",
        appointment.archived ? "border-dashed border-slate-300" : "",
        appointment.isBlocked ? "bg-slate-100 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.05)_10px,rgba(0,0,0,0.05)_20px)] border-slate-300 !text-slate-500" : "",
        isDragging ? "z-50 ring-2 ring-[var(--primary)] ring-offset-2 cursor-grabbing" : "cursor-grab",
        highlightedAppointmentId === appointment.id && "z-50 ring-2 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
      )}
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      onClick={() => !isDragging && !isResizing && !contextMenu && onClick(appointment.id)}
      onContextMenu={handleContextMenu}
      style={finalStyle}
      transition={{ 
        delay: highlightedAppointmentId === appointment.id ? 0 : index * 0.02, 
        duration: highlightedAppointmentId === appointment.id ? 3 : 0.18,
        ease: "easeInOut"
      }}
      type="button"
      {...listeners}
      {...attributes}
    >
      <div className="w-full h-full flex flex-col overflow-hidden pointer-events-none transition-all duration-500">
        <AppointmentCardContent
          appointment={appointment}
          getAppointmentEndTime={getAppointmentEndTime}
          isCurrentDay={isCurrentDay}
        />
      </div>

      {isOverdue && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[2px_0_6px_rgba(239,68,68,0.4)]"
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Resize Handle */}
      {!isPast && (
        <div
          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-20 flex justify-center items-end pb-[2px] opacity-0 hover:opacity-100 transition-opacity"
          onPointerDown={handleResizeStart}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <div className="w-8 h-[3px] rounded-full bg-slate-400/60" />
        </div>
      )}

      {contextMenu && createPortal(
        <div
          className="fixed z-[100] min-w-[160px] bg-white rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden text-sm animate-in fade-in zoom-in duration-150"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="p-2 pb-1 border-b border-slate-100 mb-1">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Alterar status</p>
          </div>
          <div className="p-1 font-medium flex flex-col gap-0.5">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-slate-700"
              onClick={() => {
                updateAppointmentStatus(appointment.id, "Confirmado");
                setContextMenu(null);
              }}
            >
              <Check className="w-4 h-4 text-slate-400" />
              Confirmado
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-slate-700"
              onClick={() => {
                updateAppointmentStatus(appointment.id, "Pendente");
                setContextMenu(null);
              }}
            >
              <Clock className="w-4 h-4 text-slate-400" />
              Pendente
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-slate-700"
              onClick={(e) => {
                updateAppointmentStatus(appointment.id, "Concluído");
                setContextMenu(null);
                
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                const x = (rect.left + rect.width / 2) / window.innerWidth;
                const y = (rect.top + rect.height / 2) / window.innerHeight;
                
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { x, y },
                  colors: ['#10b981', '#34d399', '#059669', '#fbbf24', '#f59e0b'],
                  zIndex: 1000
                });
              }}
            >
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
              Concluído
            </button>
            <div className="h-px bg-slate-100 my-1 mx-1" />
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-slate-700"
              onClick={() => {
                updateAppointmentStatus(appointment.id, "Cancelado");
                setContextMenu(null);
              }}
            >
              <XCircle className="w-4 h-4 text-slate-400" />
              Cancelado
            </button>
          </div>
        </div>,
        document.body
      )}
    </motion.button>
  );
}
