import { TreatmentHistory } from "@/components/patient/history/treatment_history"

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">ประวัติการรักษา</h1>
        <TreatmentHistory />
      </div>
    </div>
  )
}
