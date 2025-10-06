import { AppointmentHeader } from "@/components/patient/appointment/appointment_header"
import { AppointmentList } from "@/components/patient/appointment/appointment_list"
import { AppointmentForm } from "@/components/patient/appointment/appointment_form"

export default function AppointmentPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <AppointmentHeader />

        <AppointmentList />

        <AppointmentForm />
      </div>
    </div>
  )
}
