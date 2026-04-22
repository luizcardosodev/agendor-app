import { create } from "zustand";
import { saveFile, getFilesByAppointmentId, deleteFilesByAppointmentId } from "@/lib/indexed-db";

interface AttachmentState {
  attachedFiles: File[];
  isLoading: boolean;
  
  // Actions
  loadAttachments: (appointmentId: string) => Promise<void>;
  addAttachment: (file: File) => void;
  removeAttachment: (file: File) => void;
  persistAttachments: (appointmentId: string) => Promise<void>;
  clearAttachments: () => void;
}

export const useAttachmentStore = create<AttachmentState>((set, get) => ({
  attachedFiles: [],
  isLoading: false,

  loadAttachments: async (appointmentId: string) => {
    set({ isLoading: true });
    try {
      const files = await getFilesByAppointmentId(appointmentId);
      set({ attachedFiles: files });
    } catch (error) {
      console.error("Failed to load attachments:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addAttachment: (file: File) => {
    set(state => ({ attachedFiles: [...state.attachedFiles, file] }));
  },

  removeAttachment: (file: File) => {
    set(state => ({
      attachedFiles: state.attachedFiles.filter(f => 
        !(f.name === file.name && f.lastModified === file.lastModified)
      )
    }));
  },

  persistAttachments: async (appointmentId: string) => {
    try {
      const { attachedFiles } = get();
      // First clear existing files for this appointment to handle deletions
      await deleteFilesByAppointmentId(appointmentId);
      
      // Save all current files
      for (const file of attachedFiles) {
        await saveFile(file, appointmentId);
      }
    } catch (error) {
      console.error("Failed to persist attachments:", error);
    }
  },

  clearAttachments: () => set({ attachedFiles: [] }),
}));

