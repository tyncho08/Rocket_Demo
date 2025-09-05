import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CreateLoanApplicationDto } from '@/lib/api';

interface LoanApplicationProgress {
  currentStep: number;
  completedSteps: Set<number>;
  formData: Partial<CreateLoanApplicationDto>;
  isDirty: boolean;
}

interface LoanStore {
  // Application state
  applicationProgress: LoanApplicationProgress;
  
  // Actions
  setCurrentStep: (step: number) => void;
  setStepCompleted: (step: number) => void;
  updateFormData: <T extends keyof CreateLoanApplicationDto>(
    section: T, 
    data: Partial<CreateLoanApplicationDto[T]>
  ) => void;
  resetApplication: () => void;
  setIsDirty: (dirty: boolean) => void;
  
  // Progress calculation
  getProgressPercentage: () => number;
  isStepValid: (step: number) => boolean;
}

const initialState: LoanApplicationProgress = {
  currentStep: 1,
  completedSteps: new Set(),
  formData: {},
  isDirty: false
};

export const useLoanStore = create<LoanStore>()(
  persist(
    (set, get) => ({
      applicationProgress: initialState,

      setCurrentStep: (step) => 
        set((state) => ({
          applicationProgress: {
            ...state.applicationProgress,
            currentStep: step
          }
        })),

      setStepCompleted: (step) =>
        set((state) => ({
          applicationProgress: {
            ...state.applicationProgress,
            completedSteps: new Set([...state.applicationProgress.completedSteps, step])
          }
        })),

      updateFormData: (section, data) =>
        set((state) => ({
          applicationProgress: {
            ...state.applicationProgress,
            formData: {
              ...state.applicationProgress.formData,
              [section]: {
                ...state.applicationProgress.formData[section],
                ...data
              }
            },
            isDirty: true
          }
        })),

      resetApplication: () => 
        set({ applicationProgress: initialState }),

      setIsDirty: (dirty) =>
        set((state) => ({
          applicationProgress: {
            ...state.applicationProgress,
            isDirty: dirty
          }
        })),

      getProgressPercentage: () => {
        const { completedSteps } = get().applicationProgress;
        return (completedSteps.size / 6) * 100; // 6 total steps
      },

      isStepValid: (step) => {
        const { formData } = get().applicationProgress;
        
        switch (step) {
          case 1: // Personal Info
            return !!(formData.personalInfo?.firstName && 
                     formData.personalInfo?.lastName && 
                     formData.personalInfo?.dateOfBirth);
          case 2: // Employment
            return !!(formData.employmentInfo?.employmentStatus && 
                     formData.employmentInfo?.monthlyIncome);
          case 3: // Financial
            return !!(formData.financialInfo?.annualIncome && 
                     formData.financialInfo?.monthlyDebts);
          case 4: // Loan Details
            return !!(formData.loanAmount && 
                     formData.propertyValue && 
                     formData.downPayment);
          case 5: // Property Info
            return !!(formData.propertyInfo?.address && 
                     formData.propertyInfo?.city && 
                     formData.propertyInfo?.state);
          case 6: // References
            return !!(formData.references?.personal?.length);
          default:
            return false;
        }
      }
    }),
    {
      name: 'loan-application-progress',
      storage: createJSONStorage(() => localStorage),
      // Only persist form data, not completed steps
      partialize: (state) => ({ 
        applicationProgress: {
          ...state.applicationProgress,
          completedSteps: new Set() // Reset completed steps on reload
        }
      })
    }
  )
);