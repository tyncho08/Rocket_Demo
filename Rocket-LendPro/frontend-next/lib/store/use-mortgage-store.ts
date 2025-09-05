import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MortgageCalculationDto, MortgageCalculationResult } from '@/lib/api';

interface CalculationHistory {
  id: string;
  date: string;
  params: MortgageCalculationDto;
  result: MortgageCalculationResult;
  name?: string;
}

interface MortgageStore {
  // Current calculation
  currentCalculation: MortgageCalculationDto | null;
  currentResult: MortgageCalculationResult | null;
  
  // Calculation history
  history: CalculationHistory[];
  
  // Actions
  setCalculation: (calc: MortgageCalculationDto) => void;
  setResult: (result: MortgageCalculationResult) => void;
  saveToHistory: (name?: string) => void;
  loadFromHistory: (id: string) => void;
  deleteFromHistory: (id: string) => void;
  clearHistory: () => void;
}

export const useMortgageStore = create<MortgageStore>()(
  persist(
    (set, get) => ({
      currentCalculation: null,
      currentResult: null,
      history: [],

      setCalculation: (calc) => set({ currentCalculation: calc }),
      
      setResult: (result) => set({ currentResult: result }),
      
      saveToHistory: (name) => {
        const { currentCalculation, currentResult } = get();
        if (!currentCalculation || !currentResult) return;

        const newEntry: CalculationHistory = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          params: currentCalculation,
          result: currentResult,
          name
        };

        set((state) => ({
          history: [newEntry, ...state.history].slice(0, 20) // Keep last 20
        }));
      },

      loadFromHistory: (id) => {
        const entry = get().history.find((h) => h.id === id);
        if (entry) {
          set({
            currentCalculation: entry.params,
            currentResult: entry.result
          });
        }
      },

      deleteFromHistory: (id) => {
        set((state) => ({
          history: state.history.filter((h) => h.id !== id)
        }));
      },

      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'mortgage-calculations',
      storage: createJSONStorage(() => localStorage)
    }
  )
);