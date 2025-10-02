import { DoctorSchedule } from "@/components/doctor/doctor_schedule"

export default function DoctorSchedulePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">ตารางเวลานัดหมายของแพทย์</h1>
        <DoctorSchedule />
      </div>
    </div>
  )
}
