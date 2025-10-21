import { DoctorSchedule } from "@/components/doctor/doctor_schedule"

export default function DoctorSchedulePage() {
  return (
    <div className="min-h-screen bg-background bg-blue-400">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <DoctorSchedule />
      </div>
    </div>
  )
}
