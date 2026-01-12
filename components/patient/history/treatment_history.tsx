"use client"

import { Badge } from "@/components/ui/badge"
import { Clock, User, Stethoscope, ChevronRight, FileText, Activity } from "lucide-react"
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
              <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">

                <div className="p-4 bg-blue-50 border-b border-blue-200">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                        <Activity className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-lg text-blue-800">
                        {record.department}
                      </span>
                    </div>
                    <Badge className={`${record.status === 'Completed' ? 'bg-green-500' : 'bg-gray-500'}`}>
                      {record.status}
                    </Badge>
                  </div>

                  <div className="flex items-center text-gray-600 bg-white/50 p-2 rounded-md border border-blue-100">
                    <Clock className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
                    <span className="mr-1">วันที่เข้ารับการรักษา:</span>
                    <span className="font-semibold text-gray-800">
                      {format(new Date(record.date), "dd MMM yyyy", { locale: th })}
                    </span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="font-semibold text-gray-800">
                      เวลา {record.time} น.
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-4">

                  <div className="flex items-center  text-gray-700">
                    <User className="h-4 w-4 mr-2 text-gray-500 shrink-0" />
                    <span className="text-gray-500 mr-1">แพทย์ผู้รักษา:</span>
                    <span className="font-semibold text-gray-900">{record.doctorname}</span>
                  </div>

                  <div className="border border-gray-100 bg-gray-50 rounded-lg p-3">
                    <h5 className="font-semibold text-gray-700 flex items-center mb-1">
                      <Stethoscope className="h-4 w-4 mr-2 text-green-600 shrink-0" />
                      การวินิจฉัยโรค
                    </h5>
                    <p className=" text-gray-600 ml-6 leading-relaxed">
                      {record.diag_name}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <Link href={`treatment_record/${record.appointment_id}`} className="block">
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-lg font-medium transition-colors group">
                        <FileText className="h-4 w-4" />
                        ดูรายละเอียดการรักษาและใบรับรองแพทย์
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </Link>
                  </div>

                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}
