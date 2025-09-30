"use client"

import { useState } from "react"
import { PatientListSidebar } from "@/components/vitals_track/patient-list-sidebar"
import { PatientSummary } from "@/components/vitals_track/patient-summary"
import { VitalSignsChart } from "@/components/vitals_track/vital-signs-chart-doc"
import { SymptomLog } from "@/components/vitals_track/symptom-log"
import { DoctorActions } from "@/components/vitals_track/doctor-actions"
import { mockPatients, mockVitalSigns, mockSymptoms, mockTargets } from "@/lib/mock_data"
import { Activity } from "lucide-react"

export default function DoctorMonitoringDashboard() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(mockPatients[0]?.id || null)

  const selectedPatient = mockPatients.find((p) => p.id === selectedPatientId)
  const vitalSigns = selectedPatientId ? mockVitalSigns[selectedPatientId] || [] : []
  const symptoms = selectedPatientId ? mockSymptoms[selectedPatientId] || [] : []
  const targets = selectedPatientId ? mockTargets[selectedPatientId] : null

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <PatientListSidebar
        patients={mockPatients}
        selectedPatientId={selectedPatientId}
        onSelectPatient={setSelectedPatientId}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {selectedPatient ? (
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">แดชบอร์ดติดตามผลผู้ป่วย</h1>
                <p className="text-sm text-muted-foreground">ระบบ Telemedicine - Doctor&apos;s Monitoring Dashboard</p>
              </div>
            </div>

            {/* Patient Summary */}
            <PatientSummary patient={selectedPatient} />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Charts and Symptoms */}
              <div className="lg:col-span-2 space-y-6">
                {targets && <VitalSignsChart vitalSigns={vitalSigns} targets={targets} />}
                <SymptomLog symptoms={symptoms} />
              </div>

              {/* Right Column - Doctor Actions */}
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
