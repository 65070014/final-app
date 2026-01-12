import { TreatmentHistory } from "@/components/patient/history/treatment_history"
import { PatientNav } from "@/components/patient/patient_nav"
import { Card } from "@/components/ui/card"
import { FileText } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="flex h-screen bg-slate-200 font-sans">
      <PatientNav />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <header>
            <Card className="p-6 w-full shadow-sm border border-slate-300 rounded-xl bg-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">ประวัติการรักษา</h1>
                    <p className="text-slate-500  mt-1 ">
                      บันทึกการวินิจฉัย, ผลการตรวจ, และรายละเอียดการรักษาทั้งหมด
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </header>

          <div className="min-h-[500px]"> 
             <TreatmentHistory />
          </div>

        </div>
      </main>
    </div>
  )
}
