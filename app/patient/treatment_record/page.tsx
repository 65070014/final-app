import { TreatmentHistory } from "@/components/patient/history/treatment_history"
import { PatientNav } from "@/components/patient/patient_nav"
import { Card } from "@/components/ui/card"

export default function HistoryPage() {
  return (
    <div className="flex h-screen bg-slate-200 font-sans">
      <PatientNav />
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <Card className="p-6 w-full shadow-lg border border-slate-400 rounded-lg">
            <h1 className="text-2xl font-bold">ประวัติการรักษา</h1>
          </Card>
        </header>
        <div className="max-w-5xl mx-auto p-6 space-y-6 ">
          <TreatmentHistory />
        </div>
      </main>
    </div>
  )
}
