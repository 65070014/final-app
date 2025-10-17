export interface Patient {
  id: string
  app_id: string
  diag_id: string
  name: string
  age: number
  chronicConditions: string
  allergies: string
  diag_name: string
  monitoringStartDate: Date
  monitoringEndDate: Date
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

export interface AppointmentList {
  id: string;
  patient: string;
  date: string;
  time: string;
  patient_status:string
  symptoms: string
}

export interface Notification{
    notification_type: string; 
    message_text: string;
    linkUrl?: string;
    create_at: string
    is_read: boolean
}

export interface TreatmentHistorys{
    appointment_id: string
    department: string; 
    date: string;
    time: string;
    doctorname: string
    diag_name: string
    status: string
}

export interface MedicationDetail {
    medicine_name: string;
    dosage: string;
    quantity: number;
    usage: string;
    note: string;
}

export interface TreatmentDetail{
  appointment_id: string;
  date: string;
  time: string;
  doctorname: string
  patient:string
  diag_name: string
  diag_code: string
  diag_note: string
  monitoringStatus: string
  medications:MedicationDetail[]
}

export interface DispensingRecord {
    prescription_id: string;
    appointment_date: string;
    doctor_name: string;
    items: MedicationDetail[];
}

export type VitalRecord = {
  id: string
  date: string
  time: string
  systolic?: number
  diastolic?: number
  weight?: number
  temp?: number
  notes?: string
}

export interface PatientVitalSummary {
    age: number;
    patient: string;
    patient_id: string;
    pr: number | null;
    rr: number | null;
    sbp: number | null;
    dbp: number | null;
    weight: number | null;
    temp: number | null;
    symptoms: string | null;
    allergies: string | null;
    underlying_diseases: string | null;
}