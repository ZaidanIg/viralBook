import { create } from 'zustand';
import { EBookParams, GenerationStatus, GeneratedBook, OutlineOption } from '../types';

interface GenerationState {
  // Config
  params: EBookParams;
  setParams: (params: Partial<EBookParams>) => void;

  // Outline Flow
  options: OutlineOption[];
  selectedOption: OutlineOption | null;
  setOptions: (options: OutlineOption[]) => void;
  setSelectedOption: (option: OutlineOption | null) => void;

  // Generation Pipeline State
  bookNode: GeneratedBook | null;
  status: GenerationStatus;
  currentStep: string;
  progress: number;
  totalSteps: number;
  errorDetails: string | null;
  errorModal: { isOpen: boolean; title: string; message: string; };

  // Actions
  setBookNode: (node: GeneratedBook | null) => void;
  updateBookConfig: (updates: Partial<GeneratedBook>) => void;
  setStatus: (status: GenerationStatus) => void;
  setProgress: (current: number, total: number, stepText: string) => void;
  setError: (error: string) => void;
  showErrorModal: (title: string, message: string) => void;
  closeErrorModal: () => void;
  reset: () => void;
}

const defaultParams: EBookParams = {
  topic: "",
  category: "Edukasi",
  targetAudience: "Umum",
  tone: "Informatif & Edukatif",
  includeOutline: true,
  pageRange: "Micro-Book (10-20 Halaman)",
};

export const useGenerationStore = create<GenerationState>((set) => ({
  params: defaultParams,
  setParams: (updates) => set((state) => ({ params: { ...state.params, ...updates } })),

  options: [],
  selectedOption: null,
  setOptions: (options) => set({ options }),
  setSelectedOption: (selectedOption) => set({ selectedOption }),

  bookNode: null,
  status: GenerationStatus.IDLE,
  currentStep: "",
  progress: 0,
  totalSteps: 0,
  errorDetails: null,
  errorModal: { isOpen: false, title: "", message: "" },

  setBookNode: (bookNode) => set({ bookNode }),
  
  updateBookConfig: (updates) => set((state) => {
    if (!state.bookNode) return state;
    return { bookNode: { ...state.bookNode, ...updates } };
  }),

  setStatus: (status) => set({ status }),
  
  setProgress: (progress, totalSteps, currentStep) => set({ 
    progress, 
    totalSteps, 
    currentStep 
  }),
  
  setError: (errorDetails) => set((state) => ({ 
    errorDetails, 
    status: GenerationStatus.ERROR,
    errorModal: state.errorModal.isOpen ? state.errorModal : { isOpen: true, title: "Terjadi Kesalahan", message: errorDetails }
  })),

  showErrorModal: (title, message) => set({
    errorModal: { isOpen: true, title, message },
    errorDetails: message,
    status: GenerationStatus.ERROR
  }),

  closeErrorModal: () => set((state) => ({
    errorModal: { ...state.errorModal, isOpen: false }
  })),

  reset: () => set({
    status: GenerationStatus.IDLE,
    currentStep: "",
    progress: 0,
    totalSteps: 0,
    errorDetails: null,
    bookNode: null,
    options: [],
    selectedOption: null
  })
}));
