"use client"
import { useState, useEffect } from "react"
import { ClipboardList, PlusCircle } from "lucide-react"
import Link from "next/link"
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface RecentAppointment {
  id: number;
  patient: string;
  date: string;
  time: string;
  department: string;
  status: string;
  patient_status: string;
}

export default function NurseDashboard() {
  const [appointments, setAppointments] = useState<RecentAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentAppointments = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/appointments');
        if (!res.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลนัดหมายล่าสุดได้");
        }
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentAppointments();
  }, []);

  return (
    <div className="min-h-screen  p-8  bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg shadow-lg">
      <div className="max-w-6xl mx-auto">

        <div className="bg-blue-900 text-white rounded-lg p-6 mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Nurse Dashboard</h1>
          <span className="text-sm">ยินดีต้อนรับ, พยาบาล</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* หมายเหตุ: คุณอาจจะต้องเปลี่ยน path ให้ตรงกับโครงสร้างโปรเจกต์ของคุณ */}
          <Link href="/nurse/appointments">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md flex flex-col items-center hover:bg-gray-100 cursor-pointer">
              <PlusCircle className="w-8 h-8 text-blue-600 mb-2" />
              <p className="font-medium">เพิ่มการนัดหมาย</p>
            </div>
          </Link>
          <Link href="/nurse/appointment_history">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md flex flex-col items-center hover:bg-gray-100 cursor-pointer">
              <ClipboardList className="w-8 h-8 text-green-600 mb-2" />
              <p className="font-medium">ดูประวัติการนัดหมาย</p>
            </div>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">การนัดหมายล่าสุด</h2>
          {isLoading ? (
            <p>กำลังโหลดข้อมูล...</p>
          ) : (
            <div className="space-y-4">
              {appointments.length > 0 ? appointments.map(appt => (
                <div key={appt.id} className="p-4 border dark:border-gray-700 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">{appt.patient}</p>
                    <p className="text-sm  dark:text-gray-400">{format(new Date(appt.date), "dd MMM yyyy", { locale: th })} | {appt.time} | {appt.department}</p>
                  </div>
                  <div className="flex items-center gap-2 text-center">
                    <div>
                      <p className="text-xs  mb-1">คนไข้</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${appt.patient_status === "Confirmed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"}`}>
                        {appt.patient_status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs  mb-1">แพทย์</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${appt.status === "Confirmed" || appt.status === "Complete" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"}`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                </div>
              )) : <p>ไม่มีการนัดหมายล่าสุด</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}