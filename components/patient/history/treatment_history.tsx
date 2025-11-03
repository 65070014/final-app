"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Stethoscope } from "lucide-react"
import { Button } from "../../ui/button"
import { useEffect, useState } from "react";
import { TreatmentHistorys } from "@/lib/types";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export function TreatmentHistory() {
  const { data: session, status } = useSession();
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
    <div className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
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
            history.map((record, index) => (
              <Card key={index} className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-lg">{record.department}</h2>
                  <Badge>{record.status}</Badge>
                </div>

                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {format(new Date(record.date), "dd MMM yyyy", { locale: th })} เวลา {record.time}
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <p className="text-sm">แพทย์ผู้รักษา: {record.doctorname}</p>
                </div>

                <div className="flex items-start gap-2">
                  <Stethoscope className="h-4 w-4 text-green-500 mt-1" />
                  <p className="text-sm">การวินิจฉัย: {record.diag_name}</p>
                </div>
                <Link href={`treatment_record/${record.appointment_id}`}>
                  <Button variant="outline" size="sm" className="mt-2">
                    ดูรายละเอียดการรักษา
                  </Button>
                </Link>
              </Card>
            ))
          )}
        </>
      )}
    </div>
  )
}
