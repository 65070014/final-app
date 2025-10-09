export interface Patient {
  id: string
  name: string
  age: number
  chronicConditions: string[]
  allergies: string[]
  status: "ACTIVE" | "CLOSED"
  monitoringStartDate: Date
  monitoringEndDate: Date
  riskLevel: "high" | "medium" | "low"
}

export interface VitalSign {
  patientId: string
  timestamp: Date
  sbp: number
  dbp: number
  pr: number
  rr: number
  weight: number
  height: number
  temperature: number
  bloodSugar: number
}

export interface Symptom {
  id: string
  patientId: string
  timestamp: Date
  description: string
  severity: "high" | "medium" | "low"
}

export interface Target {
  systolicMax: number
  diastolicMax: number
  weightTarget: number
  bloodSugarMax?: number
}

export type FormErrors = {
  [key: string]: string; 
};


export interface FormRegisterData {
    firstName: string;
    lastName: string;
    gender: string;
    nation: string;
    occupation: string;
    phone_number: string;
    id: string;
    dob: string;
    bloodType: string;
    email: string;
    houseno: string;
    road: string;
    tambon: string;
    ampur: string;
    changwat: string;
    village: string;
    emergency_phone_number: string;
    underlying_disease: string;
    drugallergy: string;
    weight: number;
    height: number;
    password: string;
    confirm_password:string;
}

export interface Appointment {
  id: number;
  patient: string;
  date: string;
  time: string;
  doctorname: string;
  department: string;
  status:string;
  patient_status:string
  is_vitals_filled:boolean
}
