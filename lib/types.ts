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
  id: string
  patientId: string
  timestamp: Date
  systolic: number
  diastolic: number
  weight: number
  bloodSugar?: number
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
    genetic_disease: string;
    drugallergy: string;
    weight: number;
    height: number;
    password: string;
    confirm_password:string;
}
