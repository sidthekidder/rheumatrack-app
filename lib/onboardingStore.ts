import { create } from 'zustand';

export interface OnboardingPatientDraft {
  name: string;
  age: string; // string while editing; converted to number on submit
  patientId: string;
  city: string;
  state: string;
  country: string;
}

interface OnboardingState {
  patient: OnboardingPatientDraft;
  setPatient: (p: OnboardingPatientDraft) => void;
  reset: () => void;
}

const empty: OnboardingPatientDraft = {
  name: '',
  age: '',
  patientId: '',
  city: '',
  state: 'Maharashtra',
  country: 'India',
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  patient: empty,
  setPatient: (patient) => set({ patient }),
  reset: () => set({ patient: empty }),
}));
