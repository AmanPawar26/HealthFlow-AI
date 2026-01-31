
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export enum Frequency {
  OD = 'Once Daily (OD)',
  BD = 'Twice Daily (BD)',
  TDS = 'Thrice Daily (TDS)',
  QID = 'Four times daily (QID)',
  PRN = 'As needed (PRN)',
  CUSTOM = 'Custom'
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: Frequency;
  duration: string;
  instructions: string;
}

export interface PatientDetails {
  name: string;
  age: number | '';
  gender: Gender;
  upid: string;
  phone: string;
  email: string;
  allergies: string;
}

/**
 * Initial empty patient data template
 */
export const INITIAL_PATIENT: PatientDetails = {
  name: '',
  age: '',
  gender: Gender.MALE,
  upid: '',
  phone: '',
  email: '',
  allergies: '',
};

export interface PrescriptionData {
  diagnosis: string;
  medications: Medication[];
  advice: string;
  followUp: string;
  date?: string; // Added for history tracking
}

export interface PatientRecord {
  details: PatientDetails;
  history: PrescriptionData[];
}

export type ScreenType = 'PATIENT_DETAILS' | 'VOICE_INPUT' | 'REVIEW_PRESCRIPTION' | 'FINAL_PRESCRIPTION';

export interface AllergyConflict {
  medicationName: string;
  allergy: string;
}