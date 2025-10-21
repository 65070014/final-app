"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from 'next/navigation';
import { FileText, ChevronRight, Clock } from "lucide-react"
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { TreatmentHistorys } from "@/lib/types";

export function HistorySection() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true)
  const [history, setHistory] = useState<TreatmentHistorys[]>([])
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (status !== 'authenticated' || !session?.user?.id) {
        if (status !== 'loading') {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const patientId = session.user.id;
        const response = await fetch(`/api/patients/treatment_history/${patientId}`);

        if (!response.ok) {
          throw new Error('ไม่สามารถดึงรายการนัดหมายได้');
        }

        const data = await response.json();
        setHistory(data);
        console.log(data)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Error fetching appointments:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    if (status === 'authenticated') {
      fetchHistory();
    }

  }, [session, status]);

  return (
    <div>
      <Card className="lg:col-span-2 p-6 bg-gradient-to-r from-blue-100 to-blue-50 border-blue-25 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">ประวัติการรักษาล่าสุด</h3>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <Button onClick={() => router.push('/patient/treatment_record')} variant="ghost" size="sm" className="text-blue-500 hover:text-blue-500/80">
            ดูทั้งหมด
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-gray-500 py-10">กำลังโหลดรายการ...</p>
          ) : (
            <>
              {history.length === 0 ? (
                <div className="text-center py-10 border rounded-lg bg-gray-50">
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    ไม่พบรายการประวัติการรักษา
                  </p>
                </div>
              ) : (
                history.map((visit, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer "
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg ">
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground">{visit.department}</p>
                          <Badge variant="secondary" className="text-xs">
                            {visit.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{visit.doctorname}</p>
                        <p className="text-sm text-muted-foreground">{visit.diag_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{visit.date}</p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto mt-1" /> 
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
