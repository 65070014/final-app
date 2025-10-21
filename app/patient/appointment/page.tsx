import { AppointmentHeader } from "@/components/patient/appointment/appointment_header"
import { AppointmentList } from "@/components/patient/appointment/appointment_list"
import { AppointmentForm } from "@/components/patient/appointment/appointment_form"

export default function AppointmentPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <AppointmentHeader />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-1 space-y-4">
            <AppointmentList />
          </div>
          <div className="lg:col-span-2">
            <AppointmentForm />
          </div>
        </div>
      </div>
    </div>
  )
}
