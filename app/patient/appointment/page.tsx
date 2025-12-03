import { AppointmentList } from "@/components/patient/appointment/appointment_list"
import { AppointmentForm } from "@/components/patient/appointment/appointment_form"
import { PatientNav } from "@/components/patient/patient_nav"
import { Card } from "@/components/ui/card"

export default function AppointmentPage() {
  return (
    <div className="flex h-screen bg-slate-200 font-sans">
      <PatientNav />
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <Card className="p-6 w-full shadow-md border border-slate-400 rounded-lg">
            <h1 className="text-2xl font-bold text-foreground">การนัดหมาย</h1>
            <p className="text-muted-foreground">ดูนัดหมายที่มีอยู่และสร้างนัดหมายใหม่</p>
          </Card>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 shadow-md border border-slate-400 rounded-lg">
            <AppointmentForm />
          </div>
          <div className="lg:col-span-1 space-y-4 shadow-lg border border-slate-400 rounded-lg">
            <AppointmentList />
          </div>
        </div>
      </main>
    </div>
  )
}
