import { PatientHeader } from "@/components/patient/dashboard/patient_header"
import { ActionZone } from "@/components/patient/dashboard/action_zone"
import { HistorySection } from "@/components/patient/dashboard/patient_history"

export default function PatientDashboard() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl bg-gray-300 dark:bg-gray-950 mx-auto p-4 space-y-6 rounded-xl">

        <PatientHeader />

        <ActionZone />

        <HistorySection />
      </div>
    </div>
  )
}
