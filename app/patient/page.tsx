import { PatientHeader } from "@/components/patient/dashboard/patient_header"
import { ActionZone } from "@/components/patient/dashboard/action_zone"
import { HistorySection } from "@/components/patient/dashboard/patient_history"

export default function PatientDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto p-4 space-y-6">

        <PatientHeader />

        <ActionZone />

        <HistorySection />
      </div>
    </div>
  )
}
