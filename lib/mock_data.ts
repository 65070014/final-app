import type { Patient, VitalSign, Symptom } from "./types"

export const mockPatients: Patient[] = [
  {
    id: "1",
    name: "สมชาย ใจดี",
    age: 58,
    chronicConditions: ["ความดันโลหิตสูง", "เบาหวาน"],
    allergies: ["Penicillin"],
    status: "ACTIVE",
    monitoringStartDate: new Date("2025-01-15"),
    monitoringEndDate: new Date("2025-04-15"),
    riskLevel: "high",
  },
  {
    id: "2",
    name: "สมหญิง รักษ์ดี",
    age: 45,
    chronicConditions: ["ความดันโลหิตสูง"],
    allergies: [],
    status: "ACTIVE",
    monitoringStartDate: new Date("2025-02-01"),
    monitoringEndDate: new Date("2025-05-01"),
    riskLevel: "medium",
  },
  {
    id: "3",
    name: "วิชัย สุขใจ",
    age: 62,
    chronicConditions: ["เบาหวาน", "โรคหัวใจ"],
    allergies: ["Aspirin"],
    status: "ACTIVE",
    monitoringStartDate: new Date("2025-01-20"),
    monitoringEndDate: new Date("2025-03-20"),
    riskLevel: "high",
  },
  {
    id: "4",
    name: "มาลี สวยงาม",
    age: 52,
    chronicConditions: ["ความดันโลหิตสูง"],
    allergies: [],
    status: "ACTIVE",
    monitoringStartDate: new Date("2025-02-10"),
    monitoringEndDate: new Date("2025-05-10"),
    riskLevel: "low",
  },
]

export const mockVitalSigns: Record<string, VitalSign[]> = {
  "1": Array.from({ length: 30 }, (_, i) => ({
    id: `vs-1-${i}`,
    patientId: "1",
    timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
    systolic: 145 + Math.random() * 20 - 10,
    diastolic: 92 + Math.random() * 15 - 7,
    weight: 78 + Math.random() * 4 - 2,
    bloodSugar: 180 + Math.random() * 40 - 20,
  })),
  "2": Array.from({ length: 30 }, (_, i) => ({
    id: `vs-2-${i}`,
    patientId: "2",
    timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
    systolic: 135 + Math.random() * 15 - 7,
    diastolic: 85 + Math.random() * 10 - 5,
    weight: 65 + Math.random() * 2 - 1,
  })),
  "3": Array.from({ length: 30 }, (_, i) => ({
    id: `vs-3-${i}`,
    patientId: "3",
    timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
    systolic: 150 + Math.random() * 25 - 12,
    diastolic: 95 + Math.random() * 18 - 9,
    weight: 82 + Math.random() * 5 - 2,
    bloodSugar: 200 + Math.random() * 50 - 25,
  })),
  "4": Array.from({ length: 30 }, (_, i) => ({
    id: `vs-4-${i}`,
    patientId: "4",
    timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
    systolic: 125 + Math.random() * 10 - 5,
    diastolic: 80 + Math.random() * 8 - 4,
    weight: 58 + Math.random() * 1.5 - 0.75,
  })),
}

export const mockSymptoms: Record<string, Symptom[]> = {
  "1": [
    {
      id: "s-1-1",
      patientId: "1",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      description: "ปวดหัวรุนแรง มีอาการวิงเวียน",
      severity: "high",
    },
    {
      id: "s-1-2",
      patientId: "1",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      description: "น้ำหนักเพิ่มขึ้น 2 กก. ใน 3 วัน",
      severity: "high",
    },
    {
      id: "s-1-3",
      patientId: "1",
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      description: "เหนื่อยง่าย หายใจลำบากเล็กน้อย",
      severity: "medium",
    },
  ],
  "2": [
    {
      id: "s-2-1",
      patientId: "2",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      description: "รู้สึกปกติ ไม่มีอาการผิดปกติ",
      severity: "low",
    },
  ],
  "3": [
    {
      id: "s-3-1",
      patientId: "3",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      description: "เจ็บหน้าอก แน่นหน้าอกเล็กน้อย",
      severity: "high",
    },
    {
      id: "s-3-2",
      patientId: "3",
      timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
      description: "อ่อนเพลีย เหนื่อยง่าย",
      severity: "medium",
    },
  ],
  "4": [
    {
      id: "s-4-1",
      patientId: "4",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      description: "สุขภาพดี ไม่มีอาการผิดปกติ",
      severity: "low",
    },
  ],
}

export const mockTargets: Record<string, any> = {
  "1": { systolicMax: 140, diastolicMax: 90, weightTarget: 75, bloodSugarMax: 180 },
  "2": { systolicMax: 140, diastolicMax: 90, weightTarget: 63 },
  "3": { systolicMax: 130, diastolicMax: 85, weightTarget: 78, bloodSugarMax: 160 },
  "4": { systolicMax: 140, diastolicMax: 90, weightTarget: 58 },
}
