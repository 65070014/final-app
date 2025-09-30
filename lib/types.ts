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
