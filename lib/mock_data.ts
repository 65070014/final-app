import type {VitalRecord, Symptom } from "./types"
import { format } from "date-fns";

export const mockVitalSigns: Record<string, VitalRecord[]> = {
    "60001": Array.from({ length: 30 }, (_, i) => {
        const pastDate = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
        
        return {
            id: `vs-1-${i}`,
            date: format(pastDate, 'yyyy-MM-dd'), 
            time: format(pastDate, 'HH:mm'),
            
            systolic:Math.round(145 + Math.random() * 20 - 10),
            diastolic:Math.round(92 + Math.random() * 15 - 7),
            weight:parseFloat((78 + Math.random() * 4 - 2).toFixed(1)),
            temp:parseFloat((36 + Math.random() * 0.5 - 0.2).toFixed(1)),
            notes: i % 10 === 0 ? "มีอาการปวดศีรษะเล็กน้อย" : undefined,
        };
    })
};

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockTargets: Record<string, any> = {
  "60001": { systolicMax: 140, diastolicMax: 90, weightTarget: 75, tempMax: 40 },
  "2": { systolicMax: 140, diastolicMax: 90, weightTarget: 63 },
  "3": { systolicMax: 130, diastolicMax: 85, weightTarget: 78, bloodSugarMax: 160 },
  "4": { systolicMax: 140, diastolicMax: 90, weightTarget: 58 },
}
