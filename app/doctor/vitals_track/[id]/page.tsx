"use client"

import { useEffect, useState } from "react"
import { PatientListSidebar } from "@/components/doctor/vitals_track/patient-list-sidebar"
import { PatientSummary } from "@/components/doctor/vitals_track/patient-summary"
import { VitalSignsChart } from "@/components/doctor/vitals_track/vital-signs-chart-doc"
import { SymptomLog } from "@/components/doctor/vitals_track/symptom-log"
import { DoctorActions } from "@/components/doctor/vitals_track/doctor-actions"
import { Activity } from "lucide-react"
import { Patient, VitalRecord } from "@/lib/types"

export default function DoctorMonitoringDashboard() {
  const [Patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(Patients[0]?.id || null)
    const [vitalSigns, setvitalSigns] = useState<VitalRecord[]>([])


  const selectedPatient = Patients.find((p) => p.id === selectedPatientId)
  const targets = { systolicMax: 140, diastolicMax: 90, weightTarget: 75, tempMax: 40 }

  const [, setIsLoading] = useState(true)
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatient() {

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/patient_list_monitor?doctor_id=1`);

        if (!response.ok) {
          throw new Error('ไม่สามารถดึงรายการนัดหมายได้');
        }

        const data = await response.json();
        setPatients(data);
        console.log(data)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Error fetching appointments:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPatient();

  }, []);

  useEffect(() => {
    if (!selectedPatientId) {
      setvitalSigns([]);
      return;
    }

    async function fetchRecord() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/patients/vitals_track?patientId=${selectedPatientId}`);

        if (!response.ok) {
          throw new Error(`ไม่สามารถดึงข้อมูลสัญญาณชีพได้ (Status: ${response.status})`);
        }

        const data = await response.json();

        setvitalSigns(data);
        console.log("Fetched Vitals:", data);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Error fetching vitals:", error);
        setError(error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecord();

  }, [selectedPatientId]);

  return (
    <div className="flex h-screen bg-background">
      <PatientListSidebar
        patients={Patients}
        selectedPatientId={selectedPatientId}
        onSelectPatient={setSelectedPatientId}
      />

      <div className="flex-1 overflow-auto">
        {selectedPatient ? (
          <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">แดชบอร์ดติดตามผลผู้ป่วย { }</h1>
                <p className="text-sm text-muted-foreground">ระบบ Telemedicine - Doctor&apos;s Monitoring Dashboard</p>
              </div>
            </div>

            <PatientSummary patient={selectedPatient} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {targets && <VitalSignsChart vitalSigns={vitalSigns} targets={targets} />}
                <SymptomLog vitalSigns={vitalSigns} />
              </div>

              <div className="lg:col-span-1">
                <DoctorActions patient={selectedPatient} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">เลือกผู้ป่วยจากรายการด้านซ้าย</p>
          </div>
        )}
      </div>
    </div>
  )
}
